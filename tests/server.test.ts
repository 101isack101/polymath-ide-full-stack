import request from 'supertest';
import { app } from '../server';
import fs from 'fs';
import path from 'path';

describe('GET /', () => {
  it('AC-001: responds with HTTP 200 and text/html content-type', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  it('NFR-004: index.html has no local asset references (all inline or CDN)', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    // Should not reference relative local .css or .js files
    expect(html).not.toMatch(/<link[^>]+href=["'][^"']*\.css["']/);
    // Local script src must not be a relative path (CDN URLs start with https://)
    const scriptSrcMatches = html.match(/<script[^>]+src=["']([^"']+)["']/g) || [];
    scriptSrcMatches.forEach((tag) => {
      const srcMatch = tag.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        expect(srcMatch[1]).toMatch(/^https?:\/\//);
      }
    });
  });

  it('AC-002: index.html contains monaco-container, chat-input, and send-btn elements', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toMatch(/id=["']monaco-container["']/);
    expect(html).toMatch(/id=["']chat-input["']/);
    expect(html).toMatch(/id=["']send-btn["']/);
  });

  it('AC-003: index.html loads Monaco Editor via CDN', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toMatch(/https:\/\/cdnjs\.cloudflare\.com.*monaco/);
  });

  it('AC-004: index.html fetch call targets /api/chat with prompt and current_code', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toMatch(/\/api\/chat/);
    expect(html).toMatch(/prompt/);
    expect(html).toMatch(/current_code/);
  });
});

describe('POST /api/chat', () => {
  const validBody = { prompt: 'explain this', current_code: 'def foo(): pass' };

  it('AC-005: responds with HTTP 200, application/json, and agents array of 3', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send(validBody)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('agents');
    expect(Array.isArray(res.body.agents)).toBe(true);
    expect(res.body.agents).toHaveLength(3);

    res.body.agents.forEach((agent: { agent_name: string; response: string }) => {
      expect(typeof agent.agent_name).toBe('string');
      expect(typeof agent.response).toBe('string');
    });
  });

  it('AC-006: agent_name values are Claude-Architect, GPT-Coder, Gemini-Reviewer', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send(validBody)
      .set('Content-Type', 'application/json');

    const names = res.body.agents.map((a: { agent_name: string }) => a.agent_name);
    expect(names).toContain('Claude-Architect');
    expect(names).toContain('GPT-Coder');
    expect(names).toContain('Gemini-Reviewer');
  });

  it('AC-007: prompt is referenced in at least one response AND code snippet is referenced in at least one response', async () => {
    const prompt = 'explain this';
    const code = 'def foo(): pass';
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt, current_code: code })
      .set('Content-Type', 'application/json');

    const responses: string[] = res.body.agents.map((a: { response: string }) => a.response);
    const allText = responses.join(' ');

    // Verify prompt is referenced (no HTML encoding applied, raw string expected)
    const promptReferenced = responses.some((r) => r.includes(prompt));
    expect(promptReferenced).toBe(true);

    // Verify code is referenced (no HTML encoding applied, raw string expected)
    const codeReferenced = responses.some((r) => r.includes(code));
    expect(codeReferenced).toBe(true);

    // Also confirm no HTML entity encoding occurred (would corrupt code content)
    expect(allText).not.toContain('&lt;');
    expect(allText).not.toContain('&gt;');
    expect(allText).not.toContain('&amp;');
  });

  it('AC-007: code with HTML-special chars is not entity-encoded in response', async () => {
    const prompt = 'review';
    const code = 'if a < b && c > d: pass';
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt, current_code: code })
      .set('Content-Type', 'application/json');

    const allText: string = res.body.agents.map((a: { response: string }) => a.response).join(' ');
    // The raw characters must appear, not HTML-encoded versions
    expect(allText).toContain('a < b');
    expect(allText).not.toContain('&lt;');
    expect(allText).not.toContain('&amp;');
  });

  it('AC-008: frontend index.html renders agent_name and response properties', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toMatch(/agent_name|agentName|agent\.name/);
    expect(html).toMatch(/\.response/);
  });

  it('AC-009: missing prompt returns HTTP 400 with error field', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ current_code: 'print(1)' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });

  it('AC-010: missing current_code returns HTTP 400 with error field', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: 'hello' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });

  it('AC-009/010: non-string prompt returns HTTP 400', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: 42, current_code: 'x = 1' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('AC-011: CORS header is present', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send(validBody)
      .set('Content-Type', 'application/json')
      .set('Origin', 'http://example.com');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('AC-014: response is returned within 500ms', async () => {
    const start = Date.now();
    await request(app)
      .post('/api/chat')
      .send(validBody)
      .set('Content-Type', 'application/json');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it('Enforces max prompt length by truncating without error', async () => {
    const longPrompt = 'a'.repeat(15000);
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: longPrompt, current_code: 'x = 1' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    // The full 15k prompt must not appear verbatim in any response — it was truncated to 10k
    const responses: string[] = res.body.agents.map((a: { response: string }) => a.response);
    const fullPromptPresent = responses.some((r) => r.includes('a'.repeat(15000)));
    expect(fullPromptPresent).toBe(false);
  });

  it('Enforces max code length by truncating without error', async () => {
    const longCode = 'b'.repeat(15000);
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: 'test', current_code: longCode })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
  });
});
