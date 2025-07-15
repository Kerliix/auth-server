# Security Policy

## Reporting a Vulnerability

This project is for internal use only. Please report any security vulnerabilities directly to the security team via internal channels.

## Supported Versions

Currently, we support the latest stable release of the server. Security patches will be applied promptly.

## Security Practices

- Passwords are hashed with bcrypt.
- JWTs are signed securely with a secret key.
- HTTPS is required in production environments.
- Rate limiting is applied to sensitive endpoints.
- Refresh tokens and access tokens are stored securely.
