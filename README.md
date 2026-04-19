# Social Project MVP

A reputation system simulator built with Nuxt 4, Express.js, and PostgreSQL.

## Features

- **Admin Simulation**: Add users, adjust ratings, and reset the database.
- **User Flows**:
  - Profile management with referral links.
  - Rating boosting (mock payment flow).
  - User search with backend filtering.
  - Profile unlocking (mock payment flow).
  - Feedback system.
- **Dockerized**: Easy setup with Docker Compose.
- **Testing**: Backend (Jest) and Frontend (Vitest) coverage.

## Tech Stack

- **Frontend**: Nuxt 4, Tailwind CSS, Pinia
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **Testing**: Jest, Vitest, Supertest
- **Deployment**: Docker, Docker Compose

## Quick Start

1. **Clone the repository** (or extract the zip).
2. **Run with Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```
3. **Access the application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:4000/api](http://localhost:4000/api)

## Development Setup

### Backend

```bash
cd backend
npm install
npx prisma generate
# Set DATABASE_URL in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Running Tests

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm run test:unit
```

## API Endpoints

| Method | Route                     | Description       |
| ------ | ------------------------- | ----------------- |
| GET    | `/api/users`              | List/Search users |
| GET    | `/api/users/:id`          | Get user details  |
| POST   | `/api/users`              | Add mock user     |
| POST   | `/api/users/:id/rating`   | Adjust rating     |
| POST   | `/api/users/:id/feedback` | Leave feedback    |
| POST   | `/api/reset`              | Reset database    |
