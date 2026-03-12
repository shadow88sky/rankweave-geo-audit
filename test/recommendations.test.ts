import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../src/core/recommendations.js';
import type { DimensionResult } from '../src/types.js';

// "No issues" detail for each dimension
const noIssueCrawler: DimensionResult = { score: 100, detail: { crawlers: { GPTBot: true } } };
const noIssueSd: DimensionResult = {
  score: 100,
  detail: {
    hasJsonLd: true,
    matchedRecommendedTypes: ['Organization', 'WebSite', 'Product', 'FAQPage', 'Article', 'BreadcrumbList'],
    metaTags: { title: true, description: true, 'og:title': true, 'og:description': true, 'og:image': true },
  },
};
const noIssueKg: DimensionResult = { score: 100, detail: { sources: { wikidata: true, wikipedia_en: true } } };
const noIssueCb: DimensionResult = {
  score: 100,
  detail: { checks: { https: true, title: true, metaDescription: true, blogLink: true, contentLength: true } },
};

describe('generateRecommendations', () => {
  it('should generate crawler access recommendations with bilingual text', () => {
    const crawlerAccess: DimensionResult = {
      score: 78,
      detail: {
        crawlers: { GPTBot: false, ClaudeBot: false, CCBot: true },
      },
    };

    const recs = generateRecommendations(crawlerAccess, noIssueSd, noIssueKg, noIssueCb);
    expect(recs.length).toBe(1);
    expect(recs[0].priority).toBe('high');
    expect(recs[0].action_en).toContain('GPTBot');
    expect(recs[0].action_zh).toContain('GPTBot');
    expect(recs[0].action_zh).toContain('屏蔽');
  });

  it('should generate structured data recommendations', () => {
    const sd: DimensionResult = {
      score: 0,
      detail: {
        hasJsonLd: false,
        metaTags: { title: true, description: false },
      },
    };

    const recs = generateRecommendations(noIssueCrawler, sd, noIssueKg, noIssueCb);
    expect(recs.some((r) => r.action_en.includes('JSON-LD'))).toBe(true);
    expect(recs.some((r) => r.action_en.includes('meta tags'))).toBe(true);
  });

  it('should generate missing schema type recommendations', () => {
    const sd: DimensionResult = {
      score: 53,
      detail: {
        hasJsonLd: true,
        matchedRecommendedTypes: ['Organization', 'WebSite'],
        metaTags: { title: true, description: true, 'og:title': true, 'og:description': true, 'og:image': true },
      },
    };

    const recs = generateRecommendations(noIssueCrawler, sd, noIssueKg, noIssueCb);
    expect(recs.length).toBe(1);
    expect(recs[0].action_en).toContain('Product');
    expect(recs[0].action_zh).toContain('Schema');
  });

  it('should generate knowledge graph recommendations', () => {
    const kg: DimensionResult = {
      score: 0,
      detail: {
        sources: { wikidata: false, wikipedia_en: false, wikipedia_zh: false, baidu_baike: false },
      },
    };

    const recs = generateRecommendations(noIssueCrawler, noIssueSd, kg, noIssueCb);
    expect(recs[0].action_en).toContain('Wikidata');
    expect(recs[0].action_zh).toContain('Wikidata');
  });

  it('should generate content basics recommendations', () => {
    const cb: DimensionResult = {
      score: 10,
      detail: {
        checks: {
          https: true,
          title: false,
          metaDescription: false,
          ogTags: false,
          ogImage: false,
          h1: false,
          contentLength: false,
          blogLink: false,
          faqLink: false,
        },
      },
    };
    const recs = generateRecommendations(noIssueCrawler, noIssueSd, noIssueKg, cb);
    expect(recs.some((r) => r.action_en.includes('<title>'))).toBe(true);
    expect(recs.some((r) => r.action_en.includes('meta description'))).toBe(true);
    expect(recs.some((r) => r.action_en.includes('blog'))).toBe(true);
  });

  it('should sort high priority first', () => {
    const crawlerAccess: DimensionResult = {
      score: 0,
      detail: { crawlers: { GPTBot: false } },
    };
    const cb: DimensionResult = {
      score: 10,
      detail: { checks: { https: true, title: true, metaDescription: true, blogLink: false, contentLength: false } },
    };
    const recs = generateRecommendations(crawlerAccess, noIssueSd, noIssueKg, cb);
    const highIdx = recs.findIndex((r) => r.priority === 'high');
    const medIdx = recs.findIndex((r) => r.priority === 'medium');
    if (highIdx >= 0 && medIdx >= 0) {
      expect(highIdx).toBeLessThan(medIdx);
    }
  });

  it('should return empty when everything is perfect', () => {
    const perfect: DimensionResult = {
      score: 100,
      detail: {
        crawlers: { GPTBot: true, ClaudeBot: true },
        hasJsonLd: true,
        matchedRecommendedTypes: ['Organization', 'WebSite', 'Product', 'FAQPage', 'Article', 'BreadcrumbList'],
        metaTags: { title: true, description: true, 'og:title': true, 'og:description': true, 'og:image': true },
        sources: { wikidata: true, wikipedia_en: true },
        checks: { https: true, title: true, metaDescription: true, blogLink: true, contentLength: true },
      },
    };
    const recs = generateRecommendations(perfect, perfect, perfect, perfect);
    expect(recs.length).toBe(0);
  });
});
