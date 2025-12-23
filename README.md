## Attendance & Leave Management System (Backend)

Node.js/Express.js backend with MongoDB (Mongoose) that manages user authentication, daily attendance, and leave requests for **Admin** and **Student** roles using JWT-based authentication and role-based access control.

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT for authentication, `bcrypt` for password hashing

### Getting Started
- **Requirements**: Node 18+, running MongoDB or a MongoDB Atlas URI.
- **Environment variables** (in `.env`):
  - `MONGO_URI` – MongoDB connection string
  - `PORT` – server port (defaults to 5000)
  - `JWT_SECRET` – secret key for signing JWTs
- **Install dependencies**: `npm install`
- **Seed sample data**: `node seed.js` (creates admin `admin@example.com` / `123456` and some students, plus sample attendance and leaves)
- **Run server**: `npm run dev` (nodemon) or `npm start`

### Data Models
- **User**
  - `{ name: String, email: String, password: String, role: "Admin" | "Student" }`
- **Attendance**
  - `{ user: ObjectId<User>, date: Date, status: "Present" | "Absent" }`
  - One record per user per day (enforced via unique index on `{ user, date }`).
- **Leave**
  - `{ user: ObjectId<User>, reason: String, status: "pending" | "approved" | "rejected" }`

### Roles & Permissions
- **Admin**
  - View all attendance: `GET /attendance/all`
  - View/manage all leave requests: `GET /leave/all`, `PATCH /leave/:id` (approve/reject)
  - Access aggregated dashboard data.
- **Student**
  - Mark own attendance once per day: `POST /attendance`
  - View own attendance history: `GET /attendance`
  - Create leave requests: `POST /leave`
  - View own leaves: `GET /leave`

### Authentication APIs
- **POST `/auth/signup`**
  - Request body: `{ name, email, password, role? }`
  - Creates a user, hashes password with `bcrypt`, sets `role` to `"Student"` by default (or `"Admin"` when explicitly requested) and returns a JWT.
- **POST `/auth/login`**
  - Request body: `{ email, password }`
  - Verifies credentials and returns a JWT.
- **GET `/auth/logout`**
  - Clears the auth cookie for browser clients.

### Attendance APIs
- **POST `/attendance`** (Student)
  - Marks the authenticated student as **Present** for today.
  - Enforces “once per day” via unique index; returns an error if already marked.
- **GET `/attendance`** (Student)
  - Returns only the authenticated student’s attendance records.
- **GET `/attendance/all`** (Admin)
  - Returns all attendance records, populated with user info.

### Leave APIs
- **POST `/leave`** (Student)
  - Creates a leave request for the authenticated student.
  - Body: `{ reason }` (status defaults to `pending`).
- **GET `/leave`** (Student)
  - Returns only the authenticated student’s leave records.
- **GET `/leave/all`** (Admin)
  - Returns all leave requests (with user details) for admin review.
- **PATCH `/leave/:id`** (Admin)
  - Updates leave status.
  - Body: `{ status: "pending" | "approved" | "rejected" }`

### Authentication & Authorization Flow
1. User signs up via `POST /auth/signup`; password is hashed with `bcrypt` before storage.
2. User logs in via `POST /auth/login`; on success, a JWT is signed with `{ id, role }` (1 day expiry).
3. Clients can either:
   - Send `Authorization: Bearer <token>` header on each request, **or**
   - Rely on the `token` httpOnly cookie set by the server for browser-based flows.
4. `authMiddleware`:
   - Verifies the JWT using `JWT_SECRET`,
   - Loads the user from the database,
   - Attaches `req.user = { id, role, name, email }`,
   - Rejects the request with `401` when the token is missing/invalid.
5. `roleMiddleware(roles)`:
   - Ensures the authenticated user’s `role` is in the allowed list,
   - Rejects with `403` when the role is insufficient.
6. Ownership is enforced by querying with `user: req.user.id` on student routes, so a user can only see and modify **their own** attendance and leave data, while admin routes never filter by a specific user.

All attendance, leave, and dashboard routes that expose sensitive data are protected by `authMiddleware`, and admin‑only actions are additionally gated by `roleMiddleware(["Admin"])`.

