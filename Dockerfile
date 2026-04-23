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

# Устанавливаем curl для healthcheck, nginx и netcat для проверки портов
RUN apt-get update && apt-get install -y curl nginx netcat-openbsd postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем backend с production зависимостями
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --production

COPY --from=backend-builder /app/backend ./backend

# Копируем frontend
COPY --from=frontend-builder /app/frontend/.output ./frontend/.output

# Создаём конфиг nginx
RUN printf 'events {}\n\
    \n\
    http {\n\
    server {\n\
    listen 80;\n\
    \n\
    location /api/ {\n\
    proxy_pass http://localhost:4000/api/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
    \n\
    location / {\n\
    proxy_pass http://localhost:3000/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
    }\n\
    }\n\
    ' > /etc/nginx/nginx.conf

# Создаём скрипт запуска с улучшенной читаемостью
RUN printf '#!/bin/sh\n\
    \n\
    # Цвета для вывода\n\
    RED="\\033[0;31m"\n\
    GREEN="\\033[0;32m"\n\
    YELLOW="\\033[1;33m"\n\
    BLUE="\\033[0;34m"\n\
    NC="\\033[0m" # No Color\n\
    \n\
    print_status() {\n\
    echo "${BLUE}[$(date +"%H:%M:%S")]${NC} $1"\n\
    }\n\
    \n\
    print_success() {\n\
    echo "${GREEN}✓${NC} $1"\n\
    }\n\
    \n\
    print_error() {\n\
    echo "${RED}✗${NC} $1"\n\
    }\n\
    \n\
    wait_for_service() {\n\
    local port=$1\n\
    local name=$2\n\
    local max_attempts=30\n\
    local attempt=1\n\
    \n\
    print_status "Waiting for $name on port $port..."\n\
    \n\
    while [ $attempt -le $max_attempts ]; do\n\
    if nc -z localhost $port 2>/dev/null; then\n\
    print_success "$name is ready (attempt $attempt)"\n\
    return 0\n\
    fi\n\
    \n\
    local wait_time=$((1 << attempt))\n\
    [ $wait_time -gt 30 ] && wait_time=30\n\
    \n\
    echo "  Attempt $attempt/$max_attempts: $name not ready, waiting ${wait_time}s..."\n\
    sleep $wait_time\n\
    attempt=$((attempt + 1))\n\
    done\n\
    \n\
    print_error "$name failed to start after $max_attempts attempts"\n\
    return 1\n\
    }\n\
    \n\
    setup_database() {\n\
    print_status "Setting up database..."\n\
    \n\
    if [ -z "$DATABASE_URL" ]; then\n\
    print_error "DATABASE_URL is not set"\n\
    return 1\n\
    fi\n\
    \n\
    cd /app/backend\n\
    \n\
    # Проверяем соединение с БД\n\
    print_status "Checking database connection..."\n\
    if ! npx prisma db execute --stdin --sql "SELECT 1" 2>/dev/null; then\n\
    print_error "Cannot connect to database"\n\
    return 1\n\
    fi\n\
    print_success "Database connection established"\n\
    \n\
    # Применяем схему\n\
    print_status "Applying database schema..."\n\
    npx prisma db push --skip-generate\n\
    \n\
    if [ $? -ne 0 ]; then\n\
    print_error "Failed to apply database schema"\n\
    return 1\n\
    fi\n\
    print_success "Database schema applied"\n\
    \n\
    # Сброс БД если включен RESET_DB\n\
    if [ "$RESET_DB" = "1" ]; then\n\
    echo ""\n\
    print_status "${YELLOW}⚠ RESET_DB is enabled - resetting database...${NC}"\n\
    \n\
    # Полный сброс БД\n\
    echo "  Running: prisma migrate reset --force --skip-seed"\n\
    npx prisma migrate reset --force --skip-seed\n\
    \n\
    if [ $? -ne 0 ]; then\n\
    print_error "Failed to reset database"\n\
    return 1\n\
    fi\n\
    print_success "Database reset completed"\n\
    \n\
    # Запускаем seed\n\
    echo ""\n\
    print_status "Seeding database with initial data..."\n\
    npx prisma db seed\n\
    \n\
    if [ $? -ne 0 ]; then\n\
    print_error "Seeding failed"\n\
    return 1\n\
    fi\n\
    print_success "Database seeding completed"\n\
    else\n\
    print_status "Skipping database reset (set RESET_DB=1 to enable full reset and seeding)"\n\
    fi\n\
    \n\
    return 0\n\
    }\n\
    \n\
    cleanup() {\n\
    echo ""\n\
    print_status "Shutting down services..."\n\
    kill $NGINX_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null\n\
    exit 0\n\
    }\n\
    \n\
    trap cleanup INT TERM\n\
    \n\
    # ============================================\n\
    # Main execution\n\
    # ============================================\n\
    echo ""\n\
    echo "========================================="\n\
    echo "  Starting Services"\n\
    echo "========================================="\n\
    echo ""\n\
    \n\
    # Setup database\n\
    if ! setup_database; then\n\
    print_error "Database setup failed, exiting..."\n\
    exit 1\n\
    fi\n\
    \n\
    echo ""\n\
    print_status "Starting backend server..."\n\
    cd /app/backend\n\
    node src/app.js 2>&1 &\n\
    BACKEND_PID=$!\n\
    wait_for_service 4000 "Backend" || exit 1\n\
    \n\
    echo ""\n\
    print_status "Starting frontend server..."\n\
    cd /app/frontend\n\
    PORT=3000 node .output/server/index.mjs 2>&1 &\n\
    FRONTEND_PID=$!\n\
    wait_for_service 3000 "Frontend" || exit 1\n\
    \n\
    echo ""\n\
    print_status "Starting nginx reverse proxy..."\n\
    nginx -g "daemon off;" 2>&1 &\n\
    NGINX_PID=$!\n\
    \n\
    echo ""\n\
    echo "========================================="\n\
    print_success "All services ready!"\n\
    echo "  🌐 Nginx:  http://localhost:80"\n\
    echo "  🔧 Backend: http://localhost:4000"\n\
    echo "  🎨 Frontend: http://localhost:3000"\n\
    echo "========================================="\n\
    echo ""\n\
    \n\
    wait $NGINX_PID $BACKEND_PID $FRONTEND_PID\n\
    ' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -f http://localhost:80/api/health || exit 1

CMD ["/app/start.sh"]