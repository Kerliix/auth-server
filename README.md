# Kerliix Auth & OAuth Server

This is a secure, centralized identity and access management server developed by **Kerliix**. It handles authentication and OAuth 2.0 authorization for Kerliix's internal applications, authorized third-party systems, and supported devices.

The system is designed to:

- Centralize user authentication and identity management
- Issue and validate OAuth 2.0 access, exchange, and refresh tokens
- Enforce role-based access control (RBAC) and scope validation
- Enable client registration and management
- Securely manage client credentials and app-level permissions

This server ensures consistent, secure authentication flows and enforces internal security policies.

> **Note**: This system is strictly for internal use by Kerliix. Unauthorized access or distribution is prohibited under the project's [proprietary license](./LICENSE).

---

## What's Included

- User registration, authentication, and profile management
- Complete OAuth 2.0 Authorization Server
- Admin panel backend
- RESTful API backend
- Multi-Factor Authentication (MFA)
- Brute force protection mechanisms

---

## Features

### Authentication
- Login
- Logout
- Registration
- Email verification
- Password reset
- Role-based access control (RBAC)

### Profile & Account Management
- Update user info
- Upload profile picture
- Change password
- Reset MFA
- Manage passkeys
- Manage recovery codes

### OAuth 2.0 Support
- Authorization
- Token exchange
- Refresh tokens
- Client consent
- Scopes enforcement
- OIDC user info retrieval

### Organizations
- Organization plans
- Registration
- Organization management

### Admin Panel
- Admin authentication
- User management
- Client management
- Organization management
- System logs

### Multi-Factor Authentication (MFA)
- Email MFA
- SMS MFA
- TOTP (Time-based One-Time Passwords)

### Brute Force Protection
- Login attempts
- Password reset attempts
- OTP MFA attempts
- Email MFA attempts
- SMS MFA attempts
- Change email/username attempts

### Logging System
- Logger levels
- Email logs
- SMS logs
- Activity logs

---

## Auth Flow

- Registration
- Login
- Password reset

---

## Architecture and Components

### High-Level Architecture

![High-Level Architecture](https://raw.githubusercontent.com/Kerliix/.github/main/illustrations/auth-architecture.png)

### Explanation
The system is built using modular components to allow scalability, maintainability, and security.

### Main Components
- Express.js backend (Node.js)
- MongoDB (data store)
- OAuth 2.0 provider (`oauth2orize`)
- Admin backend API
- Redis (rate limiting and session store)
- Email & SMS services (Gmail SMTP, Twilio)
- Logger & Audit system

---

## Protocols and Flows Supported

- OAuth 2.0 Authorization Code Flow
- OAuth 2.0 Client Credentials Flow
- OAuth 2.0 Refresh Token Flow
- OpenID Connect (OIDC) UserInfo Endpoint
- Passkey/WebAuthn (coming soon)

---

## External Dependencies

- Node.js 20+
- MongoDB
- Twilio
- Gmail SMTP
- OAuth2orize (RFC-compliant auth middleware)

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

## Setup and Installation

To set up locally:

```bash
git clone https://github.com/Kerliix/auth-server.git
cd auth-server
npm install
cp .env.example .env
# Update .env with your secrets
npm run dev

---

For full setup and Docker support, see [SETUP.md](./SETUP.md).

---

## Contributing

This project is for internal use by **Kerliix** employees and licensed personnel only.

Contributions are welcome from authorized individuals. Please follow company guidelines and submit changes through the designated review process.

For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

**Project Maintainer**  
**Kaliika Mahmood**  
Email: mahmoodkaliika810@gmail.com
Github: [Mood810](https://github.com/Mood810)  

---

## License

This project is proprietary software licensed exclusively for the internal use of **Kerliix**.

Redistribution or external use is prohibited without explicit written permission.

See the [LICENSE](./LICENSE) file for full terms.

---

## Contact

We’re happy to hear from you!

If you have feature requests, feedback, encountering bugs, contribute or discuss enhancements:

- **Contact developer:** Kaliika Mahmood – mahmoodkaliika810@gmail.com  
- **Open an issues on Github:** [GitHub Issues](https://github.com/kerliix/auth-server/issues)  
- **Email us directly at:** dev@kerliix.com  
- **Also find support at:** support@kerliix.com  
- **-	For enterprise licensing, partnership inquiries or legal questions, please contact our legal team at:** legal@kerliix.com  

We aim to respond promptly and continuously improve the platform.

---

## Acknowledgments & Special Thanks

Thanks to the **Node.js** and open-source community.

---

### Development & Maintenance Team

| Name                   | GitHub                                       | Email                                  | Image |
|------------------------|----------------------------------------------|----------------------------------------|--------|
| Kaliika Mahmood (Lead) | [Mood810](https://github.com/Mood810)        | mahmoodkaliika810@gmail.com            | ![Mahmood](https://raw.githubusercontent.com/Kerliix/.github/main/personalles/kaliika-mahmood.png) |
| Kigenyi Abdulrahman    | [kigs500](https://github.com/kigs500)        | kigenyiabdulrahman500@gmail.com        | ![Kigenyi](https://raw.githubusercontent.com/Kerliix/.github/main/personalles/placeholder.png) |
| Ssewankambo Ismael     | [sewankambo2](https://github.com/sewankambo2)| sewankamboismael2@yahoo.com            | ![Ismael](https://raw.githubusercontent.com/Kerliix/.github/main/personalles/placeholder.png) |
| Naluyange Rahmah       | [rahma-n](https://github.com/rahma-n)        | rahmahnaluyange@outlook.com            | ![Rahmah](https://raw.githubusercontent.com/Kerliix/.github/main/personalles/placeholder.png) |

---

### Advisors

- Huwais Saad  
- Mahame Rayan  
- Mpalanyi Ali Muhammad

---

### Investors

| Organization                 | Motto             | Website                                       | Image |
|-----------------------------|-------------------|-----------------------------------------------|--------|
| KMSS (Kawempe Muslim SS)    | _Go higher_       | [kawempemuss.ac.ug](https://kawempemuss.ac.ug) | ![KMSS](https://raw.githubusercontent.com/Kerliix/.github/main/organizations/kmss.png) |
| IUIU Kampala Campus          |                   | [iuiukc.iuiu.ac.ug](https://iuiukc.iuiu.ac.ug) | ![IUIU](https://raw.githubusercontent.com/Kerliix/.github/main/organizations/placeholder.png) |
| Prodomate                   | _Make it known_   | [prodomate.com](https://prodomate.com)        | ![Prodomate](https://raw.githubusercontent.com/Kerliix/.github/main/organizations/prodomate.png) |
| Innovation Village           |                   | [innovationvillage.ac.ug](https://innovationvillage.ac.ug) | ![Innovation Village](https://raw.githubusercontent.com/Kerliix/.github/main/organizations/placeholder.png) |

---

### Early Testers

- Kigenyi Abdulrahman  
- Ssewankambo Ismael

---

### Partners & Device Contributors

Special thanks to the following individuals for providing their devices for testing and development:

- Mahame Rayan  
- Sembalirwa Ryhan  
- Mariam Nakimuli Alia  
- Golola Ahmed Kisenyi  
- Nanozi Shukrah  
- Nazziwa Joweria  

Special appreciation to **Kawempe Muslim Secondary School**  
![KMSS](https://raw.githubusercontent.com/Kerliix/.github/main/organizations/kmss.png)

---

![Kerliix Logo](https://raw.githubusercontent.com/Kerliix/.github/main/company/kx-logo.png)

> ©2025 Kerliix. All rights reserved.  
> _It’s all about you._
