# 🧠 Polymath IDE — Full Stack Multi-Agent AI

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Monaco_Editor-0.47-68217A?style=for-the-badge&logo=visualstudiocode&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-≥18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Jest-29-C21325?style=for-the-badge&logo=jest&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/github/actions/workflow/status/101isack101/polymath-ide/ci.yml?branch=main&style=for-the-badge&label=CI" />
</p>

> **EN:** A full-stack browser-based IDE powered by a simulated multi-agent AI panel. Write code in Monaco Editor and get instant reviews from three specialized AI agents.
>
> **ES:** IDE de navegador full stack con un panel de agentes AI simulados. Escribe código en Monaco Editor y recibe revisiones instantáneas de tres agentes AI especializados.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│                                                              │
│   ┌──────────────────────┐   ┌────────────────────────────┐ │
│   │   Monaco Editor      │   │    AI Agents Chat          │ │
│   │  (Left pane)         │   │    (Right pane)            │ │
│   │                      │   │                            │ │
│   │  Syntax highlight    │   │  ┌──────────────────────┐  │ │
│   │  Multi-language      │   │  │  Claude-Architect    │  │ │
│   │  Dark theme          │   │  │  GPT-Coder           │  │ │
│   │                      │   │  │  Gemini-Reviewer     │  │ │
│   └──────────────────────┘   └──┴──────────────────────┴──┘ │
└─────────────────────────┬────────────────────────────────────┘
                          │ POST /api/chat
                          │ { prompt, current_code }
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              Express.js Backend  (Node.js / TypeScript)      │
│                                                              │
│   Middleware: CORS · helmet · express-rate-limit · JSON      │
│                                                              │
│   GET  /         → Serves index.html (SPA)                  │
│   POST /api/chat → Validates input → generateAgentResponses  │
│                                                              │
│   Returns: { agents: [{ agent_name, response }] }           │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- 🖊 **Monaco Editor** — the same engine that powers VS Code, with syntax highlighting, multi-language support and dark theme
- 🤖 **Three AI agents** — Claude-Architect, GPT-Coder and Gemini-Reviewer each analyze your code from a different angle
- ⚡ **Sub-500ms responses** — lightweight mock backend with validated performance acceptance criteria
- 🔒 **Security-hardened server** — `helmet` headers, rate limiting (100 req/15 min), configurable CORS, CSP meta tag, input size caps
- 🧪 **15+ acceptance criteria tests** — full Jest + Supertest suite covering AC-001 through AC-014
- 🌐 **Zero frontend dependencies** — pure HTML/CSS/JS, no bundler, CDN-only assets
- ⌨️ **Keyboard shortcut** — `Ctrl+Enter` / `Cmd+Enter` to send prompt

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Editor | Monaco Editor (CDN) | 0.47.0 |
| Frontend | HTML5 / CSS3 / Vanilla JS | — |
| Backend | Node.js + Express | ≥18 / 4.18 |
| Language | TypeScript (strict mode) | 5.4 |
| Security | helmet + express-rate-limit + CORS | latest |
| Tests | Jest + ts-jest + Supertest | 29 / 7 |

---

## ⚡ Quick Start

### Requirements
- **Node.js** `>= 18`
- **npm** `>= 9`

### Install

```bash
git clone https://github.com/101isack101/polymath-ide.git
cd polymath-ide
npm install
```

### Run (production build)

```bash
npm start
```

Open **http://localhost:3000** in your browser.

### Run (development — ts-node, no build step)

```bash
npm run dev
```

### Custom port

```bash
PORT=8080 npm start
```

### Environment variables

Copy `.env.example` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed CORS origins |

---

## 🔌 API Reference

### `GET /`

Serves the single-page application (`index.html`).

**Response:** `200 OK` — `text/html`

---

### `POST /api/chat`

Sends a prompt and the current editor code to the three AI agents.

**Request body:**

```json
{
  "prompt": "Explain what this function does",
  "current_code": "function greet(name) { return `Hello, ${name}!`; }"
}
```

**Response `200 OK`:**

```json
{
  "agents": [
    {
      "agent_name": "Claude-Architect",
      "response": "[Claude-Architect] Regarding your request..."
    },
    {
      "agent_name": "GPT-Coder",
      "response": "[GPT-Coder] For the prompt..."
    },
    {
      "agent_name": "Gemini-Reviewer",
      "response": "[Gemini-Reviewer] Code review for..."
    }
  ]
}
```

**Response `400 Bad Request`:**

```json
{ "error": "'prompt' field is required and must be a string" }
```

**Limits:**
- `prompt` is truncated to 10,000 characters
- `current_code` is truncated to 10,000 characters
- Request body capped at 100 KB
- Rate limit: 100 requests / 15 minutes per IP

---

## 🧪 Tests

```bash
npm test
```

The test suite covers:

| Test ID | Description |
|---------|-------------|
| AC-001 | GET / returns HTTP 200 with text/html |
| AC-002 | index.html contains required UI elements |
| AC-003 | Monaco Editor loaded via CDN |
| AC-004 | Fetch call targets /api/chat with correct fields |
| AC-005 | POST /api/chat returns 200 with 3-agent array |
| AC-006 | Agent names are correct (Claude-Architect, GPT-Coder, Gemini-Reviewer) |
| AC-007 | Prompt and code snippet referenced in responses, no HTML encoding |
| AC-008 | Frontend renders agent_name and response properties |
| AC-009 | Missing prompt returns 400 with error field |
| AC-010 | Missing current_code returns 400 with error field |
| AC-011 | CORS header present on response |
| AC-014 | Response returned within 500ms |
| NFR-004 | No local asset references (all inline or CDN) |
| — | Max prompt length truncation (no error) |
| — | Max code length truncation (no error) |

---

## 📁 Project Structure

```
polymath-ide/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI pipeline
├── tests/
│   └── server.test.ts       # Jest acceptance criteria tests
├── .env.example             # Environment variable template
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE                  # MIT
├── SECURITY.md
├── index.html               # Single-page app (Monaco Editor + Chat UI)
├── package.json
├── server.ts                # Express server (TypeScript)
├── tsconfig.json            # TypeScript config (strict mode)
└── tsconfig.test.json       # TypeScript config for tests
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## 🔐 Security

Found a vulnerability? Please review [SECURITY.md](SECURITY.md) for the responsible disclosure process.

---

## 📄 License

[MIT](LICENSE) © 2025 Isaac Ramirez
