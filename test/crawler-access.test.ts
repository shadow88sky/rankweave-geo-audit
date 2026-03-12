import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkCrawlerAccess } from '../src/core/crawler-access.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf-8');

describe('checkCrawlerAccess', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return 100 when robots.txt is not found (404)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('HTTP 404'));
    const result = await checkCrawlerAccess('example.com', 5000);
    expect(result.score).toBe(100);
    expect(result.detail.robotsFound).toBe(false);
  });

  it('should return 100 when robots.txt is empty', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(''),
    });
    const result = await checkCrawlerAccess('example.com', 5000);
    expect(result.score).toBe(100);
  });

  it('should return 0 when all crawlers are blocked', async () => {
    const robotsTxt = fixture('robots-all-blocked.txt');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(robotsTxt),
    });
    const result = await checkCrawlerAccess('example.com', 5000);
    expect(result.score).toBe(0);
    expect(result.detail.allowedCount).toBe(0);
  });

  it('should return partial score when some crawlers are blocked', async () => {
    const robotsTxt = fixture('robots-partial.txt');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(robotsTxt),
    });
    const result = await checkCrawlerAccess('example.com', 5000);
    // GPTBot and ClaudeBot blocked → 7/9 allowed
    expect(result.score).toBe(Math.round((7 / 9) * 100));
    expect(result.detail.allowedCount).toBe(7);
    const crawlers = result.detail.crawlers as Record<string, boolean>;
    expect(crawlers['GPTBot']).toBe(false);
    expect(crawlers['ClaudeBot']).toBe(false);
    expect(crawlers['CCBot']).toBe(true);
  });

  it('should fallback to http when https fails', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      callCount++;
      if (url.startsWith('https://')) {
        return Promise.reject(new Error('HTTPS failed'));
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('User-agent: *\nAllow: /'),
      });
    });
    const result = await checkCrawlerAccess('example.com', 5000);
    expect(result.score).toBe(100);
    expect(result.detail.robotsFound).toBe(true);
  });
});
