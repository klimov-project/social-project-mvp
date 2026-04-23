# ============ STAGE 1: Build Backend ============
FROM node:22-slim AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ .
RUN npx prisma generate

# ============ STAGE 2: Build Frontend ============
FROM node:22-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ============ STAGE 3: Runtime ============
FROM node:22-slim

# Устанавливаем curl для healthcheck, nginx, netcat и postgresql-client
RUN apt-get update && apt-get install -y curl nginx netcat-openbsd postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем backend с production зависимостями
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --production 2>/dev/null || npm ci --omit=dev

COPY --from=backend-builder /app/backend ./backend

# Копируем frontend
COPY --from=frontend-builder /app/frontend/.output ./frontend/.output

# Создаём конфиг nginx
RUN cat > /etc/nginx/nginx.conf << 'EOF'
events {
}

http {
server {
listen 80;

location /api/ {
proxy_pass http://localhost:4000/api/;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
proxy_pass http://localhost:3000/;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
}
}
}
EOF

# Создаём скрипт запуска с ожиданием БД
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh

# Colors for output
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m"

print_status() {
echo "${BLUE}[$(date +"%H:%M:%S")]${NC} $1"
}

print_success() {
echo "${GREEN}✓${NC} $1"
}

print_error() {
echo "${RED}✗${NC} $1"
}

# Функция ожидания PostgreSQL
wait_for_postgres() {
local max_attempts=30
local attempt=1

print_status "Waiting for PostgreSQL to be ready..."

# Извлекаем host и port из DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):\([0-9]*\)\/.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):\([0-9]*\)\/.*/\2/p')

if [ -z "$DB_HOST" ]; then
DB_HOST="localhost"
DB_PORT="5432"
fi

print_status "Connecting to PostgreSQL at $DB_HOST:$DB_PORT"

while [ $attempt -le $max_attempts ]; do
if PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') pg_isready -h $DB_HOST -p $DB_PORT -U $(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p') 2>/dev/null; then
print_success "PostgreSQL is ready (attempt $attempt)"
return 0
fi

echo "  Attempt $attempt/$max_attempts: PostgreSQL not ready, waiting 2s..."
sleep 2
attempt=$((attempt + 1))
done

print_error "PostgreSQL failed to become ready after $max_attempts attempts"
return 1
}

if [ -z "$JWT_SECRET" ]; then
    print_error "JWT_SECRET is not set"
    print_error "Please set JWT_SECRET environment variable"
    exit 1
fi
print_success "JWT_SECRET is configured"

wait_for_service() {
local port=$1
local name=$2
local max_attempts=30
local attempt=1

print_status "Waiting for $name on port $port..."

while [ $attempt -le $max_attempts ]; do
if nc -z localhost $port 2>/dev/null; then
print_success "$name is ready (attempt $attempt)"
return 0
fi

local wait_time=$((1 << attempt))
[ $wait_time -gt 30 ] && wait_time=30

echo "  Attempt $attempt/$max_attempts: $name not ready, waiting ${wait_time}s..."
sleep $wait_time
attempt=$((attempt + 1))
done

print_error "$name failed to start after $max_attempts attempts"
return 1
}

setup_database() {
print_status "Setting up database..."

if [ -z "$DATABASE_URL" ]; then
print_error "DATABASE_URL is not set"
return 1
fi

# Ждём готовности PostgreSQL
if ! wait_for_postgres; then
return 1
fi

cd /app/backend

if [ "$RESET_DB" = "1" ]; then
echo ""
print_status "${YELLOW}⚠ RESET_DB is enabled - resetting database...${NC}"

echo "  Running: prisma migrate reset --force --skip-seed"
npx prisma migrate reset --force --skip-seed

if [ $? -ne 0 ]; then
print_error "Failed to reset database"
return 1
fi
print_success "Database reset completed"

print_status "Applying database schema..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
print_error "Failed to apply database schema"
return 1
fi
print_success "Database schema applied"

echo ""
print_status "Seeding database with initial data..."
npx prisma db seed

if [ $? -ne 0 ]; then
print_error "Seeding failed"
return 1
fi
print_success "Database seeding completed"
else
print_status "Skipping database reset (set RESET_DB=1 to enable full reset and seeding)"
fi

return 0
}

cleanup() {
echo ""
print_status "Shutting down services..."
kill $NGINX_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
exit 0
}

trap cleanup INT TERM

echo ""
echo "========================================="
echo "  Starting Services"
echo "========================================="
echo ""

# Настройка базы данных
if ! setup_database; then
print_error "Database setup failed, exiting..."
exit 1
fi

echo ""
print_status "Starting backend server..."
cd /app/backend
node src/app.js 2>&1 &
BACKEND_PID=$!
wait_for_service 4000 "Backend" || exit 1

echo ""
print_status "Starting frontend server..."
cd /app/frontend
PORT=3000 node .output/server/index.mjs 2>&1 &
FRONTEND_PID=$!
wait_for_service 3000 "Frontend" || exit 1

echo ""
print_status "Starting nginx reverse proxy..."
nginx -g "daemon off;" 2>&1 &
NGINX_PID=$!

echo ""
echo "========================================="
print_success "All services ready!"
echo "  🌐 Nginx:  http://localhost:80"
echo "  🔧 Backend: http://localhost:4000"
echo "  🎨 Frontend: http://localhost:3000"
echo "========================================="
echo ""

wait $NGINX_PID $BACKEND_PID $FRONTEND_PID
EOF

RUN chmod +x /app/start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -f http://localhost:80/api/health || exit 1

CMD ["/app/start.sh"]