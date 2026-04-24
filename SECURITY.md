# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public GitHub issue.

Instead, send a detailed report to:

**isaac.rma9@gmail.com**

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (optional)

You will receive a response within **72 hours**. If the vulnerability is confirmed, a patch will be released and you will be credited (unless you prefer to remain anonymous).

## Security Measures in This Project

- HTTP security headers via `helmet` (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- Rate limiting on `/api/chat`: 100 requests per 15 minutes per IP
- CORS restricted via `ALLOWED_ORIGINS` environment variable
- Content-Security-Policy meta tag restricting script sources to CDN and self
- Input size limits: 10,000 characters for prompt/code, 100 KB body cap
- XSS prevention: all dynamic content rendered with `textContent`, never `innerHTML`
- No `eval()` or dynamic code execution
- Input type validation on all API fields

## Scope

This is an MVP project. The following are **not** in scope:
- Authentication / authorization (not implemented by design)
- HTTPS enforcement (configure your reverse proxy or hosting provider)
- Persistent data storage (stateless by design)
