
# Kerliix Auth Server

The **Kerliix Auth Server** is a secure, production-ready OAuth2 and MFA-enabled authentication system built with **Node.js**, **Express**, and **MongoDB**. It handles user registration, login, account management, admin control, and token-based OAuth authorization for the Kerliix ecosystem.

---

## Features

### User Authentication
- Secure login & session handling
- Password change & email updates
- Multi-factor authentication (MFA) with TOTP
- Session device tracking & logout
- User profile management with avatar uploads

### Admin System
- Role-based access control (admin vs superadmin)
- Admin login with JWT
- Full control over users, clients, admins, logs, and orgs
- Admin dashboard and profile tools

### OAuth 2.0 (Provider)
- Client registration
- Authorization code and token flow support
- Token issuing endpoint with rate-limiting
- Supports user consent and scopes

### Security
- CSRF-ready architecture (via `csurf`)
- Rate limiting middleware
- Password hashing with bcrypt
- Session hijack detection (via session tracking)
- JWT expiration and role enforcement

### Developer-Friendly
- Modular folder structure
- Fully RESTful API
- Environment-based config via `.env`
- Built-in logger and error handling
- File upload support with `multer`

---

## Project Structure

```
kerliix-auth-server/
│
├── config/               # DB & session configs
├── controllers/          # Route handlers (auth, admin, user, oauth, etc.)
├── middleware/           # Auth, MFA, rate-limiter, admin checks
├── models/               # Mongoose models (User, Admin, Client, LoginLog, etc.)
├── routes/               # Route files (userRoutes, accountRoutes, adminRoutes...)
├── uploads/              # Uploaded profile images
├── public/               # Static frontend if needed
├── .env                  # Environment variables
├── server.js             # App entry point
├── README.md             # This file
```

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-org/kerliix-auth-server.git
cd kerliix-auth-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file at the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kerliix-auth
SESSION_SECRET=yourSuperSecret
JWT_SECRET=yourJWTsecret
NODE_ENV=development
```

### 4. Run the Server

```bash
npm start
```

> Runs on: `http://localhost:5000`

---

## Important Routes

### User Routes (`/api/user`)
- `GET /profile`
- `POST /change-password`
- `POST /update-profile`
- `POST /change-email`

### Security Routes (`/api/security`)
- `GET /totp/setup`
- `POST /totp/verify`
- `POST /mfa/enable`
- `POST /mfa/disable`

### Account Routes (`/api/account`)
- `POST /deactivate`
- `DELETE /delete`
- `GET /devices`
- `POST /logout-device`

### Admin Routes (`/api/admin`)
- `POST /signin`
- `GET /dashboard`
- `GET /admins`
- `POST /admins/add`
- `DELETE /admins/:id`

### OAuth Routes (`/oauth`)
- `GET /authorize`
- `POST /token`
- `POST /register-client`

---

## Security Best Practices (Implemented)

- ✅ Session store support (e.g., MongoDB via `connect-mongo`)
- ✅ Passwords hashed using `bcrypt`
- ✅ Rate limiting on auth/token endpoints
- ✅ JWTs with expiration for admin tokens
- ✅ Role-based access control (`admin`, `superadmin`)
- ✅ MFA (TOTP-based) with session validation
- ✅ File type/size check for profile uploads
- ✅ Uploads are stored securely under `/uploads`
- ✅ Input validation via middleware (to be added if not yet)

---

## Testing (Recommended)

- Use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) for API testing.
- Use test users/admins seeded into MongoDB.
- Simulate user login, MFA setup, and client OAuth authorization flow.

---

## Deployment

Make sure to:
- Use `NODE_ENV=production`
- Serve over HTTPS
- Set secure cookies (`secure`, `httpOnly`, `sameSite`)
- Persist sessions with `connect-mongo` or `redis`
- Add reverse proxy headers if behind NGINX

---

## Contributors

Built by [Kerliix ltd.](https://kerliix.com) — the creators of the **Kerliix** unified digital ecosystem.

---

## 📄 License

MIT License © 2025 Toshest Inc.

![Kerliix Logo](https://raw.githubusercontent.com/Kerliix/.github/main/company/kx-logo.png)

> ©2025 Kerliix. All rights reserved.  
> _It’s all about you._
