# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | Yes                |
| < 1.0   | No                 |

## Reporting a Vulnerability

Kerliix takes security seriously. If you discover a vulnerability in this authentication system, please report it **privately** and **promptly**.

### Contact

Email: [mahmoodkaliika810@gmail.com](mailto:mahmoodkaliika810@gmail.com)

Do **not** create a GitHub issue for security-related matters.

### Responsible Disclosure Guidelines

- Provide full details of the vulnerability
- Include reproducible steps and any related exploit code
- Allow time for us to patch before public disclosure

## Security Best Practices We Follow

- Passwords hashed with bcrypt
- Rate limiting on all sensitive routes
- Input validation and sanitization
- Session management and token revocation
- Role-based access control
- Audit logging for login and sensitive events