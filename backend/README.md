# Dashboard Backend Boilerplate

This is a minimal Node.js + Express + MongoDB (Mongoose) backend with JWT authentication and basic CRUD for todos and notes.

## Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   ```
   npm install
   ```
3. Run in dev:
   ```
   npm run dev
   ```
4. API endpoints:
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/todos (protected)
   - POST /api/todos (protected)
   - PUT /api/todos/:id (protected)
   - DELETE /api/todos/:id (protected)
   - Same pattern for /api/notes

