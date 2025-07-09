# Node.js, PostgreSQL, and Redis Dockerized Project (with OTP Auth, TypeScript)

This project is a scalable Node.js backend using **TypeScript**, Express, Sequelize (PostgreSQL), Redis, and JWT-based authentication with OTP login for agents.

## Prerequisites
- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/) installed (if not included with Docker Desktop)
- [Node.js](https://nodejs.org/) (for local development)

## Getting Started

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd assessment
   ```

2. **Configure environment variables**
   - Create a `.env` file in the root with:
     ```env
     PORT=3000
     DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
     REDIS_URL=redis://redis:6379
     JWT_SECRET=your_jwt_secret
     JWT_REFRESH_SECRET=your_refresh_secret
     ```

3. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Run the app in development (with ts-node):**
   ```sh
   npx ts-node src/app.ts
   ```
   Or, for hot-reloading (if you add nodemon):
   ```sh
   npx nodemon --watch src -e ts --exec "npx ts-node" src/app.ts
   ```

5. **Build and run for production:**
   ```sh
   npx tsc
   node dist/app.js
   ```

6. **Run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
   This will start:
   - `app`: Node.js TypeScript application (on port 3000)
   - `db`: PostgreSQL database (on port 5432)
   - `redis`: Redis server (on port 6379)

7. **Access the application:**
   - Open your browser and go to [http://localhost:3000](http://localhost:3000)

8. **API Documentation (Swagger):**
   - After starting the app, access the interactive API docs at:
     [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
   - You can explore, try out, and view schemas for all endpoints here.

## Authentication Flow (OTP Login)

### 1. Request OTP
- **Endpoint:** `POST /auth/request-otp`
- **Body:**
  ```json
  { "phone": "+1234567890" }
  ```
- **Response:**
  ```json
  { "message": "OTP sent", "phone": "+1234567890", "code": "123456" }
  ```
  > In production, the code would be sent via SMS. Here, it's returned for testing.

### 2. Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Body:**
  ```json
  { "phone": "+1234567890", "code": "123456" }
  ```
- **Response:**
  ```json
  {
    "accessToken": "...",
    "refreshToken": "...",
    "agent": { "id": 1, "phone": "+1234567890", "name": "+1234567890" }
  }
  ```

## Task Endpoints (JWT required)
> Pass the `accessToken` as a Bearer token in the `Authorization` header for protected endpoints.

### List Assigned Tasks
- **GET /tasks/assigned?agentId=1**
- **Response:** List of assigned tasks for the agent.

### Start Visit (with geolocation validation)
- **POST /tasks/:id/start-visit**
- **Body:**
  ```json
  { "lat": 12.34, "lng": 56.78 }
  ```
- **Response:** Task status updated if within 100m of location.

### Check In to Task
- **POST /tasks/:id/check-in**
- **Response:** Task status set to in-progress.

### Complete Task
- **POST /tasks/:id/complete**
- **Response:** Task status set to completed.

### Sync Offline Tasks
- **POST /tasks/sync**
- **Body:**
  ```json
  {
    "offlineTasks": [ { "id": 1, "status": "completed" } ],
    "agentId": 1
  }
  ```
- **Response:** Tasks synced.

## Rate Limiting
- OTP requests are rate-limited (max 3 per 10 minutes per phone) using Redis.

## Development
- Source code is in the `src/` directory and written in TypeScript (`.ts` files).
- Models: `src/models/`
- Controllers: `src/controllers/`
- Routes: `src/routes/`
- Main entry: `src/app.ts`

## Stopping the Services
To stop the services, press `Ctrl+C` in the terminal where Docker Compose is running, then run:
```sh
docker-compose down
```

---

Feel free to customize this setup for your needs! 