# Contributing to Kerliix Auth & OAuth Server

Thank you for your interest in contributing to the Kerliix Auth & OAuth Server.

> **Important:** Contributions are **only** accepted from **Kerliix employees** and **authorized personnel**. Unauthorized pull requests will be closed without review.

---

## Contribution Guidelines

### 1. Access Requirements

- You must be an approved Kerliix employee or an authorized contributor.
- Ensure you have access to the internal developer documentation and guidelines.

### 2. Code Review Process

All code submissions **must go through the official code review process** before being merged.

- Open a pull request (PR) to the appropriate branch (e.g., `main`, `dev`, or `feature/*`)
- Assign your team lead or reviewer to the PR
- Ensure all CI checks pass (tests, linting, coverage)
- Reviewer will leave comments or approve the changes
- Merged only after at least one approval from an authorized reviewer

### 3. Git Commit Guidelines

- Use clear, descriptive commit messages (e.g., `fix: correct JWT validation error`)
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) where possible

### 4. Development Standards

- Follow the coding standards outlined in the internal dev guide
- Maintain consistent formatting (use Prettier, ESLint where applicable)
- Include comments for complex logic and security-sensitive code

### 5. Feature Requests & Bugs

- Discuss major changes with the team before implementing
- Open an issue describing the bug/feature if one does not already exist
- Link your PR to the related issue using `Fixes #<issue_number>`

### 6. Sensitive Data

**Never commit credentials, tokens, or secrets**. Use environment variables and `.env` files with `.gitignore` enforced.

---

## Testing

All submissions must include appropriate test coverage.

- Use `npm test` to run the full test suite
- Add unit and integration tests for new features
- Ensure nothing breaks existing logic

---

## Contact

If you're unsure whether you’re authorized to contribute or have any questions, reach out to:

**Project Developer and Maintainer**  
**Kaliika Mahmood**  
Email: mahmoodkaliika810@gmail.com
Github: [Mood810](https://github.com/Mood810)  

---

> All contributions are subject to internal review and approval by Kerliix leadership.

![Kerliix Logo](https://raw.githubusercontent.com/Kerliix/.github/main/company/kx-logo.png)

> ©2025 Kerliix. All rights reserved.  
> _It’s all about you._
