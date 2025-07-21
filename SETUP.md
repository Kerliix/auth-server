# Setup Guide – Kerliix Authentication and & OAuth Authorization Server

This guide walks you through setting up the Kerliix Auth Server in your local development environment.

---

## Prerequisites

Make sure the following tools are installed on your system:

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (or use a remote cluster)
- [Git](https://git-scm.com/)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/kerliix/auth-server.git
cd auth-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Then open `.env` and fill in all required values, including:

- MongoDB URI
- Session secret
- JWT secret
- Gmail (SMTP) settings
- Twilio credentials

> **Tip:** Do not check in `.env` to version control.

### 4. Run the server

```bash
npm run dev
```

The server should be running at:  
`http://localhost:3000`

---

## Docker Setup (Recommended for Production)

### 1. Clone the repository

```bash
git clone https://github.com/kerliix/auth-server.git
cd auth-server
```

### 2. Configure environment variables

Copy and configure the `.env` file:

```bash
cp .env.example .env
```

### 3. Build and run containers

```bash
docker-compose up --build
```

This will spin up:

- Kerliix Auth Server (Node.js)
- MongoDB
- Redis

To run in detached mode:

```bash
docker-compose up -d --build
```

### 4. Access the server

Visit:  
`http://localhost:3000`

---

## Running Tests

To run unit and integration tests:

```bash
npm test
```

> Coverage reports will be generated in the `coverage/` directory.

---

## Developer Notes

- Use `npm run lint` to lint your code
- Logs are saved locally and can also be routed to external tools
- This repo includes rate limiting, MFA setup, OAuth2 flows, and RBAC support
- Admin APIs are protected with role-based permissions

---

## Troubleshooting

- MongoDB not connecting? Make sure it's running or change the URI in `.env`
- Redis error? Ensure Redis is running locally or set up a cloud Redis URI
- Port conflict? Change the `PORT` in `.env`

---

## Project Structure

```bash
Kerliix-website/
├── config/
│   ├── db.js                  # MongoDB connection setup
│   ├── Logger.js              # 
│   └── db-transport.js        #
├── controllers/
│   ├── accountController.js   # 
│   ├── registerController.js  # 
│   ├── loginController.js     # 
│   ├── securityController.js  # 
│   └── userController.js      # User profile management and role handling
├── middleware/
│   ├── auth                   # Authentication and role-checking middleware
│   ├── clientAuth.js          #
│   ├── flash.js               #
│   ├── mfa.js                 #
│   ├── verifyAdmin.js         #
│   └── rateLimiter.js         # Rate limiting logic
├── models/
│   ├── User.js                # User schema
│   ├── Client.js              # OAuth client schema
│   ├── Token.js               # Access and refresh token schema
│   └── LoginLog.js            # Device/session logging schema
├── routes/
│   ├── accountRoutes.js       # 
│   ├── adminRoutes.js         # 
│   ├── authRoutes.js          # Routes for login, register, logout
│   ├── oauthRoutes.js         # 
│   ├── securityRoutes.js      # 
│   └── userRoutes.js          # User dashboard, profile update, device sessions
├── services/
│   ├── emailService.js        # Sends welcome emails, reset emails, etc.
│   ├── smsService.js          # 
│   └── deviceService.js       # Session/device tracking
├── views/
│   ├── login.ejs              # Login page
│   ├── register.ejs           # Register page
│   ├── consent.ejs            # OAuth consent screen
│   └── dashboard.ejs          # User dashboard
├── public/
│   ├── css/
│   ├── uploads/
│   └──index.html
├── .env                       # Environment variables
├── .env.example
├── .gitignore
├── app.js
├── changelog.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── SECURITY.md
├── SETUP.md
└── server.js                 # Main Express app entry point
```

---

## Post-Setup Checklist

- [ ] Set admin account manually via DB or seed script
- [ ] Verify SMTP and Twilio integration
- [ ] Add trusted OAuth clients via DB or admin panel
- [ ] Set secure secrets in production
- [ ] Enable HTTPS and reverse proxy (e.g., NGINX) in production

---

## Need Help?

If you encounter any issues, contact the development team:

- Email: mahmoodkaliika810@gmail.com
- GitHub Issues: [Open Issue](https://github.com/kerliix/auth-server/issues)

---

![Kerliix Logo](https://raw.githubusercontent.com/Kerliix/.github/main/company/kx-logo.png)

> © 2025 Kerliix. All rights reserved.  
> _It’s all about you._
