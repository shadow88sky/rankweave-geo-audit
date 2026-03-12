import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkContentBasics } from '../src/core/content-basics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf-8');

describe('checkContentBasics', () => {
  it('should return 0 when html is empty', () => {
    const result = checkContentBasics('example.com', '', 'Could not fetch');
    expect(result.score).toBe(0);
    expect(result.detail.error).toBe('Could not fetch');
  });

  it('should score high for full page', () => {
    const html = fixture('homepage-full.html');
    const result = checkContentBasics('example.com', html, '');
    const checks = result.detail.checks as Record<string, boolean>;

    expect(checks.https).toBe(true);      // 10
    expect(checks.title).toBe(true);       // 15
    expect(checks.metaDescription).toBe(true); // 15
    expect(checks.ogTags).toBe(true);      // 10
    expect(checks.ogImage).toBe(true);     // 5
    expect(checks.h1).toBe(true);          // 10
    expect(checks.contentLength).toBe(true); // 20
    expect(checks.blogLink).toBe(true);    // 10
    expect(checks.faqLink).toBe(true);     // 5
    expect(result.score).toBe(100);
  });

  it('should score low for minimal page', () => {
    const html = fixture('homepage-minimal.html');
    const result = checkContentBasics('example.com', html, '');
    const checks = result.detail.checks as Record<string, boolean>;

    expect(checks.https).toBe(true);       // 10
    expect(checks.title).toBe(false);
    expect(checks.metaDescription).toBe(false);
    expect(checks.h1).toBe(false);
    expect(checks.blogLink).toBe(false);
    expect(result.score).toBe(10);
  });

  it('should detect SPA page', () => {
    const html = fixture('homepage-spa.html');
    const result = checkContentBasics('example.com', html, '');
    expect(result.detail.isSpa).toBe(true);
  });

  it('should detect blog and FAQ links', () => {
    const html = '<html><body><a href="/articles">Articles</a><a href="#faq">FAQ</a><p>' + 'x'.repeat(600) + '</p></body></html>';
    const result = checkContentBasics('example.com', html, '');
    const checks = result.detail.checks as Record<string, boolean>;
    expect(checks.blogLink).toBe(true);
    expect(checks.faqLink).toBe(true);
  });
});
