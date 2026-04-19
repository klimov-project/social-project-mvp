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

# Устанавливаем curl для healthcheck и nginx
RUN apt-get update && apt-get install -y curl nginx && rm -rf /var/lib/apt/lists/*

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

# Создаём единый скрипт запуска (nginx + backend + frontend)
RUN printf '#!/bin/sh\n\
    \n\
    # Функция для graceful shutdown\n\
    cleanup() {\n\
    echo "Shutting down services..."\n\
    kill $NGINX_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null\n\
    exit 0\n\
    }\n\
    \n\
    # Перехватываем сигналы\n\
    trap cleanup INT TERM\n\
    \n\
    # Запускаем nginx\n\
    echo "Starting nginx..."\n\
    nginx -g "daemon off;" &\n\
    NGINX_PID=$!\n\
    \n\
    # Запускаем backend в фоне\n\
    cd /app/backend\n\
    echo "Starting backend..."\n\
    \n\
    # Ждём PostgreSQL (если DATABASE_URL установлен)\n\
    if [ -n "$DATABASE_URL" ]; then\n\
    echo "Waiting for database..."\n\
    npx prisma db push --skip-generate\n\
    npx prisma db seed 2>/dev/null || echo "Seeding skipped or failed"\n\
    fi\n\
    \n\
    echo "Starting Express server..."\n\
    node src/app.js &\n\
    BACKEND_PID=$!\n\
    \n\
    # Запускаем frontend в фоне\n\
    cd /app/frontend\n\
    echo "Starting frontend..."\n\
    node .output/server/index.mjs &\n\
    FRONTEND_PID=$!\n\
    \n\
    # Ждём завершения любого из процессов\n\
    wait $NGINX_PID $BACKEND_PID $FRONTEND_PID\n\
    ' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/api/health || exit 1

CMD ["/app/start.sh"]