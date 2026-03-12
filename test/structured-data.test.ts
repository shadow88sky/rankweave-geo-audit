import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkStructuredData } from '../src/core/structured-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf-8');

describe('checkStructuredData', () => {
  it('should return 0 when html is empty', () => {
    const result = checkStructuredData('', 'Could not fetch');
    expect(result.score).toBe(0);
    expect(result.detail.error).toBe('Could not fetch');
  });

  it('should detect JSON-LD and schema types in full page', () => {
    const html = fixture('homepage-full.html');
    const result = checkStructuredData(html, '');

    expect(result.detail.hasJsonLd).toBe(true);
    expect(result.detail.jsonLdCount).toBe(2);
    expect(result.detail.foundTypes).toContain('Organization');
    expect(result.detail.foundTypes).toContain('WebSite');
    expect((result.detail.matchedRecommendedTypes as string[])).toContain('Organization');
    expect((result.detail.matchedRecommendedTypes as string[])).toContain('WebSite');
    // 30 (JSON-LD) + round(2/6 * 70) = 30 + 23 = 53
    expect(result.score).toBe(53);
  });

  it('should detect meta tags', () => {
    const html = fixture('homepage-full.html');
    const result = checkStructuredData(html, '');
    const meta = result.detail.metaTags as Record<string, boolean>;
    expect(meta['title']).toBe(true);
    expect(meta['description']).toBe(true);
    expect(meta['og:title']).toBe(true);
    expect(meta['og:description']).toBe(true);
    expect(meta['og:image']).toBe(true);
  });

  it('should return low score for minimal page', () => {
    const html = fixture('homepage-minimal.html');
    const result = checkStructuredData(html, '');
    expect(result.detail.hasJsonLd).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should handle @graph structure', () => {
    const html = `<html><head>
      <script type="application/ld+json">
      {"@context":"https://schema.org","@graph":[
        {"@type":"Organization","name":"Test"},
        {"@type":"WebSite","name":"Test Site"},
        {"@type":"BreadcrumbList","itemListElement":[]}
      ]}
      </script>
    </head><body></body></html>`;
    const result = checkStructuredData(html, '');
    expect(result.detail.hasJsonLd).toBe(true);
    expect(result.detail.foundTypes).toContain('Organization');
    expect(result.detail.foundTypes).toContain('WebSite');
    expect(result.detail.foundTypes).toContain('BreadcrumbList');
  });

  it('should treat BlogPosting as Article', () => {
    const html = `<html><head>
      <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"BlogPosting","name":"My Post"}
      </script>
    </head><body></body></html>`;
    const result = checkStructuredData(html, '');
    expect(result.detail.foundTypes).toContain('BlogPosting');
    expect(result.detail.foundTypes).toContain('Article');
    expect((result.detail.matchedRecommendedTypes as string[])).toContain('Article');
  });
});
