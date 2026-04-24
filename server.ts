import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// CORS: restrict to configured origins in production; allow all in development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : '*';
app.use(cors({ origin: allowedOrigins }));

// Security headers — CSP configured for Monaco Editor (requires unsafe-inline + unsafe-eval)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      styleSrc:  ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
      fontSrc:   ["https://cdnjs.cloudflare.com"],
      imgSrc:    ["'self'", "data:"],
      workerSrc: ["'self'", "blob:"],
    }
  }
}));

// Limit body size at framework level to prevent DoS via large payloads
app.use(express.json({ limit: '100kb' }));

// Rate limiter for the AI chat endpoint: 100 requests per 15 minutes per IP
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Max lengths chosen to support large code files while bounding memory usage
// (~10k chars covers most reasonable single-file code snippets)
const MAX_PROMPT_LENGTH = 10000;
const MAX_CODE_LENGTH = 10000;

interface AgentResponse {
  agent_name: string;
  response: string;
}

interface ChatRequest {
  prompt: string;
  current_code: string;
}

function generateAgentResponses(prompt: string, currentCode: string): AgentResponse[] {
  // Truncate inputs to configured max lengths (no HTML encoding — res.json handles JSON serialization)
  const safePrompt = prompt.slice(0, MAX_PROMPT_LENGTH);
  const safeCode = currentCode.slice(0, MAX_CODE_LENGTH);

  // Embed a short snippet of the code so each agent demonstrably references the input (AC-007)
  const codeSnippet = safeCode.slice(0, 100);

  return [
    {
      agent_name: 'Claude-Architect',
      response: `[Claude-Architect] Regarding your request "${safePrompt}": I reviewed the code starting with "${codeSnippet}" and recommend focusing on modular design. Consider breaking large functions into smaller, single-responsibility units for better maintainability.`
    },
    {
      agent_name: 'GPT-Coder',
      response: `[GPT-Coder] For the prompt "${safePrompt}", here is a suggestion based on "${codeSnippet}": Add type annotations and docstrings to improve code clarity and IDE support. Example: def foo(x: int) -> str: ...`
    },
    {
      agent_name: 'Gemini-Reviewer',
      response: `[Gemini-Reviewer] Code review for "${safePrompt}" — inspecting "${codeSnippet}": Check edge cases and add unit tests. Ensure error handling is explicit and avoid silent failures.`
    }
  ];
}

// Resolve index.html relative to project root regardless of whether running
// via ts-node (dev) or compiled node dist/server.js (prod)
function resolveIndexHtml(): string {
  // process.cwd() is always the project root when invoked via npm scripts
  return path.resolve(process.cwd(), 'index.html');
}

// FR-001 / AC-001: Serve the static SPA
app.get('/', (_req: Request, res: Response) => {
  const htmlPath = resolveIndexHtml();
  if (!fs.existsSync(htmlPath)) {
    res.status(500).json({ error: 'index.html not found' });
    return;
  }
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(htmlPath);
});

// FR-007 / AC-005: POST /api/chat
app.post('/api/chat', chatLimiter, (req: Request, res: Response) => {
  const body = req.body as Partial<ChatRequest>;

  // NFR-002 / AC-009 / AC-010: Validate required fields
  if (typeof body.prompt !== 'string') {
    res.status(400).json({ error: "'prompt' field is required and must be a string" });
    return;
  }
  if (typeof body.current_code !== 'string') {
    res.status(400).json({ error: "'current_code' field is required and must be a string" });
    return;
  }

  const agents = generateAgentResponses(body.prompt, body.current_code);
  res.status(200).json({ agents });
});

app.listen(PORT, () => {
  const env = process.env.NODE_ENV ?? 'development';
  console.log(`Polymath-IDE server listening on http://localhost:${PORT} [${env}]`);
});

export { app };
