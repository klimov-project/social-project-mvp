# Stage 1: Build Frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM node:22-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npx prisma generate

# Stage 3: Final Runtime
FROM node:22-slim
WORKDIR /app

# Install dependencies for both
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN cd frontend && npm install --production
RUN cd backend && npm install --production

# Copy built assets
COPY --from=frontend-builder /app/frontend/.output ./frontend/.output
COPY --from=backend-builder /app/backend ./backend

# Copy docker-compose and other files
COPY docker-compose.yml .

EXPOSE 3000 4000

# Script to run both
RUN echo '#!/bin/sh\ncd /app/backend && npx prisma migrate deploy && node src/app.js & \ncd /app/frontend && node .output/server/index.mjs' > /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
