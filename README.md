# Authentication & OAuth Server

A production-ready Node.js-based authentication server offering robust **user registration**, **login**, and **OAuth 2.0 provider** functionality. This server enables clients and third-party applications to securely authenticate users and request access tokens for protected resources.

---

## 🚀 Features

- **User Registration** – Create new user accounts with secure password hashing.
- **User Login** – Authenticate users via username/password.
- **OAuth 2.0 Provider** – Implements standard flows (Authorization Code, PKCE, etc.).
- **Session & JWT Support** – Offers session-based or token-based authentication.
- **Token Revocation & Refresh** – Supports invalidation and renewal of access tokens.
- **Password Security** – Uses bcrypt for secure password hashing.
- **Role-Based Access Control** – Optional permissions and roles system.
- **Extensible** – Easily integrate custom strategies, scopes, and flows.

---

## 🧠 High-Level Architecture Diagram

```plaintext
+-----------------------+        +-----------------------+        +--------------------+
|                       |        |                       |        |                    |
|  Client Application   +------->+ Authentication Server +------->+     Database       |
| (Web/Mobile/3rd-Party)|        |  (Node.js + Express)  |        | (MongoDB/Postgres) |
+-----------------------+        +-----------------------+        +--------------------+
           |                                |                                |
           | OAuth 2.0 / Login / Register   | Credentials Validation         | User Data
           |                                |                                | Storage
           v                                v                                v
   +------------------+         +---------------------+         +-----------------------+
   | OAuth Client App |         | Passport.js /       |         | Password Hashing (bcrypt)|
   +------------------+         | OAuth2orize Layer   |         +-----------------------+
                                +---------------------+
```

### Architecture Components

- **Client Application:** Any frontend (web/mobile) or third-party app requiring authentication.
- **Authentication Server:** Node.js server using Express.js, Passport.js, and OAuth2orize.
- **Database:** Stores users, tokens, sessions, OAuth clients.
- **Token Management:** JWTs and sessions issued after successful authentication.

---

## 📡 Supported Protocols

- OAuth 2.0 Authorization Code (with PKCE)
- OAuth 2.0 Refresh Token Grant
- OAuth 2.0 Token Revocation (RFC 7009)
- OpenID Connect (Basic Profile + UserInfo endpoint)

---

## 📦 External Dependencies

- Node.js (v18+)
- Express.js
- MongoDB + Mongoose
- Passport.js + OAuth2orize
- jsonwebtoken
- bcrypt
- express-session
- express-rate-limit
- express-validator
- nodemailer

---

## 🗂 Project Structure

```bash
Kerliix-website/
├── config/
│   ├── db.js                  # MongoDB connection setup
│   ├── passport.js            # Passport strategies and session handling
│   └── oauth.js               # OAuth2 server and grant configuration
├── controllers/
│   ├── authController.js      # Handles login, registration, logout
│   ├── oauthController.js     # Handles authorization, token, user info endpoints
│   └── userController.js      # User profile management and role handling
├── middleware/
│   ├── authMiddleware.js      # Authentication and role-checking middleware
│   └── rateLimiter.js         # Rate limiting logic
├── models/
│   ├── User.js                # User schema
│   ├── Client.js              # OAuth client schema
│   ├── Token.js               # Access and refresh token schema
│   └── LoginLog.js            # Device/session logging schema
├── routes/
│   ├── authRoutes.js          # Routes for login, register, logout
│   ├── oauthRoutes.js         # Routes for authorization, token, revoke, userinfo
│   └── userRoutes.js          # User dashboard, profile update, device sessions
├── services/
│   ├── emailService.js        # Sends welcome emails, reset emails, etc.
│   ├── tokenService.js        # Token creation, verification, revocation
│   └── deviceService.js       # Session/device tracking
├── views/
│   ├── login.ejs              # Login page
│   ├── register.ejs           # Register page
│   ├── consent.ejs            # OAuth consent screen
│   └── dashboard.ejs          # User dashboard
├── public/
│   ├── css/
│   └── js/
├── .env                       # Environment variables
├── .gitignore
├── LICENSE
├── README.md
├── package.json
└── server.js                 # Main Express app entry point
```

---

## 🔧 Installation

```bash
git clone https://github.com/kerliix/Kerliix-website.git
cd Kerliix-website
npm install
npm run dev
```

---

## 📌 Roadmap

- ✅ Add token revocation and refresh token support.
- ⏳ Implement OpenID Connect logout (RP-initiated logout).
- ⏳ Consent screen improvements.
- ⏳ Add client credentials grant type.
- ⏳ Improve rate limiting and security analytics.
- ⏳ UI for session/device management.

---

## ✅ What's Included

- Full OAuth 2.0 server implementation
- Session and JWT-based auth support
- Device and login logging
- Rate limiting and validation
- Modular codebase for extensibility
- Optional role/permission structure

---

## 🙌 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Feel free to submit issues and enhancement requests!

---

## 📬 Contact

For questions, support, or business inquiries:

📧 Email: [mahmoodkaliika810@gmail.com](mailto:mahmoodkaliika810@gmail.com)

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## 🙏 Acknowledgements

- Inspired by the OAuth 2.0 and OpenID Connect specifications.
- Thanks to the Node.js and open source community.
- Special appreciation to internal testers and contributors.