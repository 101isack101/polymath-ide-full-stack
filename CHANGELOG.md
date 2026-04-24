# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2025-04-23

### Added

- Split-screen IDE layout: Monaco Editor (left) + AI Agents Chat (right)
- Three simulated AI agents: Claude-Architect, GPT-Coder, Gemini-Reviewer
- Express.js backend with TypeScript (strict mode)
- `POST /api/chat` endpoint with input validation and length truncation
- `GET /` endpoint serving the single-page application
- 15+ acceptance criteria tests (AC-001 through AC-014) with Jest + Supertest
- `helmet` middleware for HTTP security headers
- `express-rate-limit` middleware (100 req/15 min per IP)
- Configurable CORS via `ALLOWED_ORIGINS` environment variable
- Content-Security-Policy meta tag in frontend
- Input size limits: 10,000 chars for prompt and code, 100 KB body cap
- XSS prevention via `textContent` (no `innerHTML`) in frontend
- `Ctrl+Enter` / `Cmd+Enter` keyboard shortcut to send prompt
- `PORT` environment variable support
- MIT license
- GitHub Actions CI pipeline (build + test on every push/PR)
