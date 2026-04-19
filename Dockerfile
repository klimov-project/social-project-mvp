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
RUN apt-get update && apt-get install -y curl nginx netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем backend с production зависимостями
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --production

COPY --from=backend-builder /app/backend ./backend

# Копируем frontend
COPY --from=frontend-builder /app/frontend/.output ./frontend/.output

# Создаём конфиг nginx для работы внутри одного контейнера
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

# Создаём скрипт ожидания готовности сервисов 
RUN printf '#!/bin/sh\n\
    \n\
    wait_for_service() {\n\
    local port=$1\n\
    local name=$2\n\
    local max_attempts=30\n\
    local attempt=1\n\
    \n\
    echo "Waiting for $name on port $port..."\n\
    \n\
    while [ $attempt -le $max_attempts ]; do\n\
    if nc -z localhost $port 2>/dev/null; then\n\
    echo "✓ $name is ready (attempt $attempt)"\n\
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
    echo "✗ $name failed to start after $max_attempts attempts"\n\
    return 1\n\
    }\n\
    \n\
    cleanup() {\n\
    echo "Shutting down services..."\n\
    kill $NGINX_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null\n\
    exit 0\n\
    }\n\
    \n\
    trap cleanup INT TERM\n\
    \n\
    # Запуск backend\n\
    cd /app/backend\n\
    echo "Starting backend..."\n\
    \n\
    if [ -n "$DATABASE_URL" ]; then\n\
    echo "Running Prisma setup..."\n\
    npx prisma db push --skip-generate\n\
    npx prisma db seed 2>/dev/null || echo "Seeding skipped"\n\
    fi\n\
    \n\
    node src/app.js 2>&1 &\n\
    BACKEND_PID=$!\n\
    wait_for_service 4000 "Backend" || exit 1\n\
    \n\
    # Запуск frontend\n\
    cd /app/frontend\n\
    echo "Starting frontend..."\n\
    node .output/server/index.mjs 2>&1 &\n\
    FRONTEND_PID=$!\n\
    wait_for_service 3000 "Frontend" || exit 1\n\
    \n\
    # Запуск nginx\n\
    echo "Starting nginx..."\n\
    nginx -g "daemon off;" 2>&1 &\n\
    NGINX_PID=$!\n\
    \n\
    echo "========================================="\n\
    echo "All services ready! Nginx on port 80"\n\
    echo "========================================="\n\
    \n\
    wait $NGINX_PID $BACKEND_PID $FRONTEND_PID\n\
    ' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -f http://localhost:80/api/health || exit 1

CMD ["/app/start.sh"]