import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { audit } from '../src/core/audit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf-8');

describe('audit (integration)', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return complete audit result', async () => {
    const fullHtml = fixture('homepage-full.html');

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      // robots.txt — no blocks
      if (url.includes('/robots.txt')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('User-agent: *\nAllow: /'),
        });
      }
      // Homepage
      if (url.match(/https?:\/\/example\.com\/?$/)) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(fullHtml),
        });
      }
      // Wikidata
      if (url.includes('wikidata.org')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ search: [{ id: 'Q1' }] })),
        });
      }
      // Wikipedia EN
      if (url.includes('en.wikipedia.org')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ query: { search: [{ title: 'Test' }] } })),
        });
      }
      // Others fail
      return Promise.reject(new Error('Not found'));
    });

    const result = await audit({
      domain: 'example.com',
      companyName: 'Example',
      timeout: 5000,
    });

    expect(result.domain).toBe('example.com');
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.dimensions.crawlerAccess.score).toBe(100);
    expect(result.dimensions.structuredData.score).toBeGreaterThan(0);
    expect(result.dimensions.knowledgeGraph.score).toBe(65); // wikidata 40 + en 25
    expect(result.dimensions.contentBasics.score).toBeGreaterThan(0);
    expect(Array.isArray(result.recommendations)).toBe(true);

    // Each recommendation has bilingual text
    for (const rec of result.recommendations) {
      expect(rec.action_en).toBeTruthy();
      expect(rec.action_zh).toBeTruthy();
    }
  });

  it('should normalize domain with protocol', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('fail'));

    const result = await audit({
      domain: 'https://example.com/',
      timeout: 1000,
    });

    expect(result.domain).toBe('example.com');
  });

  it('should call onProgress', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('fail'));

    const steps: string[] = [];
    await audit({
      domain: 'example.com',
      timeout: 1000,
      onProgress: (e) => steps.push(e.step),
    });

    expect(steps).toContain('started');
    expect(steps).toContain('completed');
  });

  it('should use domain as searchTerm when companyName not provided', async () => {
    const calls: string[] = [];
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      calls.push(url);
      return Promise.reject(new Error('fail'));
    });

    await audit({ domain: 'mysite.com', timeout: 1000 });

    // Knowledge graph should search for "mysite.com"
    const wikidataCall = calls.find((c) => c.includes('wikidata.org'));
    expect(wikidataCall).toContain(encodeURIComponent('mysite.com'));
  });
});
