# Smart Leads Dashboard (MERN + TypeScript)

A full-stack lead management dashboard built for the Full Stack Internship assignment using:

- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + Express + TypeScript + MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Docker: Dockerfiles + docker-compose setup

## Features Implemented

### Authentication

- User registration and login
- JWT-based auth
- Password hashing with bcrypt
- Protected routes in frontend and backend
- Auth middleware and `/auth/me` endpoint

### Role-Based Access Control

- Roles: `admin`, `sales`
- `admin` can create, update, delete leads
- `sales` can create/update and only access own leads

### Leads Module (CRUD)

- Create lead
- List leads
- View single lead details
- Update lead
- Delete lead (admin only)

### Filtering, Search, Sort, Pagination

- Filter by status
- Filter by source
- Search by name/email
- Sort by latest/oldest
- Combined filters supported
- Backend pagination with limit `10`

### Additional Mandatory Features

- Debounced search on frontend
- CSV export endpoint + frontend download flow
- Loading, empty, and error UI states
- Form validation (frontend + backend)
- Centralized API error handling

## Project Structure

```bash
Gigflow/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      types/
      utils/
      validators/
  frontend/
    src/
      components/
      context/
      hooks/
      lib/
      pages/
      types/
  docs/
    API.md
```

## Local Setup (Without Docker)

### 1) Clone and install dependencies

```bash
cd Gigflow
cd backend && npm install
cd ../frontend && npm install
```

### 2) Environment setup

Copy and fill env files:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

### 3) Run backend

```bash
cd backend
npm run dev
```

### 4) Run frontend

```bash
cd frontend
npm run dev
```

App runs on:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Docker Setup

### Run full stack with MongoDB

```bash
cd Gigflow
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

## API Documentation

Detailed API docs are available in:

- `docs/API.md`

## Build Verification

Both apps compile successfully:

- `backend`: `npm run build`
- `frontend`: `npm run build`

## Notes

- TypeScript is used across backend and frontend.
- `any` usage is avoided; interfaces/types are defined in dedicated files.
- Structure is modular to support easy scaling and maintenance.
