## Attendance & Leave System (Backend)

Small Express/Mongo/EJS app that handles authentication, attendance marking, leave requests, and simple server-rendered pages for students and admins.

### Getting Started
- Requirements: Node 18+, MongoDB URI.
- Environment: `.env` with `MONGO_URI`, `PORT` (default 5000), `JWT_SECRET`.
- Install deps: `npm install`
- Seed sample data: `node seed.js` (creates admin `admin@example.com` / `123456` and students).
- Run server: `npm run dev` or `npm start`

### Roles & Permissions
- **Admin**
  - View all attendance: `GET /attendance/all`
  - View/manage all leave requests: `GET /leave/all`, `PATCH /leave/:id` (approve/reject)
  - Access dashboard links for admin actions
- **Student**
  - Mark own attendance: `POST /attendance`
  - View own attendance: `GET /attendance`
  - Request leave: `POST /leave`
  - View own leaves: `GET /leave`

### API Surface
- `POST /auth/signup` — create user `{ name, email, password, role }`
- `POST /auth/login` — authenticate, returns JWT; HTML form sets httpOnly cookie
- `GET /auth/logout` — clears auth cookie
- `POST /attendance` — student marks present for the day
- `GET /attendance` — student attendance history
- `GET /attendance/all` — admin attendance list (populated with user info)
- `POST /leave` — student create leave `{ reason }`
- `GET /leave` — student leaves
- `GET /leave/all` — admin manage leaves
- `PATCH /leave/:id` — admin update status `{ status: approved|rejected|pending }`

All protected routes require a valid JWT in `Authorization: Bearer <token>` or the `token` httpOnly cookie set by the login form. Role checks are enforced by `roleMiddleware`.

### Authentication & Authorization Flow
1. User signs up (`/auth/signup`) → password hashed with bcrypt.
2. User logs in (`/auth/login`) → JWT signed with `id` and `role` (1 day expiry).
3. Browser logins set `token` cookie; API clients send `Authorization` header.
4. `authMiddleware` validates the token and attaches `req.user` → rejects/redirects when invalid.
5. `roleMiddleware` gates role-specific routes (Admin vs Student).
6. Server-rendered pages (EJS) read `req.user` to show navigation and data.

### Views
- Dashboard: `GET /dashboard` (auth required)
- Student: `attendance/myAttendance`, `leave/myLeaves`
- Admin: `attendance/allAttendance`, `leave/manageLeaves`

### Notes
- HTML forms can override methods via `_method` for admin leave approval.
- Attendance dates are normalized to the start of the day to avoid duplicates.

