import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkKnowledgeGraph } from '../src/core/knowledge-graph.js';

describe('checkKnowledgeGraph', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return 100 when all sources found', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('wikidata.org')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ search: [{ id: 'Q1' }] })),
        });
      }
      if (url.includes('en.wikipedia.org')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ query: { search: [{ title: 'Test' }] } })),
        });
      }
      if (url.includes('zh.wikipedia.org')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ query: { search: [{ title: 'Test' }] } })),
        });
      }
      if (url.includes('baike.baidu.com')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('<html><div class="lemmaTitle">Test</div></html>'),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const result = await checkKnowledgeGraph('Test Corp', 5000);
    expect(result.score).toBe(100);
    const sources = result.detail.sources as Record<string, boolean>;
    expect(sources.wikidata).toBe(true);
    expect(sources.wikipedia_en).toBe(true);
    expect(sources.wikipedia_zh).toBe(true);
    expect(sources.baidu_baike).toBe(true);
  });

  it('should return 0 when all sources fail', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await checkKnowledgeGraph('Unknown Corp XYZ', 5000);
    expect(result.score).toBe(0);
  });

  it('should return partial score', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('wikidata.org')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ search: [{ id: 'Q1' }] })),
        });
      }
      // All others fail
      return Promise.reject(new Error('Not found'));
    });

    const result = await checkKnowledgeGraph('Test', 5000);
    expect(result.score).toBe(40); // only wikidata
  });

  it('should return 0 when search returns empty results', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ search: [], query: { search: [] } })),
    });
    const result = await checkKnowledgeGraph('NonExistent', 5000);
    expect(result.score).toBe(0);
  });
});
