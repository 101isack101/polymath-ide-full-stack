# Contributing to Polymath IDE

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Install dependencies: `npm install`
4. Run in development mode: `npm run dev`

## Development Workflow

### Code Style

- TypeScript with **strict mode** enabled — all types must be explicit
- No `any` unless absolutely necessary
- Keep functions small and single-responsibility
- No HTML entity encoding in API responses — Express `res.json()` handles serialization

### Running Tests

Tests must pass before opening a PR:

```bash
npm test
```

The suite covers all acceptance criteria (AC-001 to AC-014). Add new tests for any new feature or bugfix.

### Building

```bash
npm run build
```

This compiles `server.ts` to `dist/server.js`. Make sure the build is clean (zero TypeScript errors).

## Opening a Pull Request

1. Make sure `npm run build` and `npm test` pass locally
2. Write a clear PR description explaining **what** changed and **why**
3. Reference any related issue with `Fixes #<number>`

## Commit Messages

Follow conventional commits format:

```
feat: add language selector to Monaco Editor
fix: handle empty prompt gracefully
docs: update API reference in README
test: add AC-015 test for rate limit header
```

## Reporting Bugs

Open a GitHub issue with:
- A clear title and description
- Steps to reproduce
- Expected vs. actual behavior
- Node.js and npm versions

## Questions

Open a GitHub Discussion or reach out via the contact info in [SECURITY.md](SECURITY.md).
