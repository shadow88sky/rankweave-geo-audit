import * as cheerio from 'cheerio';
import type { DimensionResult } from '../types.js';

export function checkContentBasics(
  domain: string,
  html: string,
  fetchError: string,
): DimensionResult {
  if (!html) {
    return {
      score: 0,
      detail: { error: fetchError || 'Could not fetch homepage', checks: {} },
    };
  }

  const $ = cheerio.load(html);
  const checks: Record<string, boolean> = {};
  let score = 0;

  // HTTPS (10)
  checks.https = domain.startsWith('https://') || !domain.startsWith('http://');
  if (checks.https) score += 10;

  // Title (15)
  checks.title = !!$('title').text().trim();
  if (checks.title) score += 15;

  // Meta description (15)
  checks.metaDescription = !!$('meta[name="description"]').attr('content')?.trim();
  if (checks.metaDescription) score += 15;

  // OG tags (10)
  checks.ogTags =
    !!$('meta[property="og:title"]').attr('content')?.trim() &&
    !!$('meta[property="og:description"]').attr('content')?.trim();
  if (checks.ogTags) score += 10;

  // OG image (5)
  checks.ogImage = !!$('meta[property="og:image"]').attr('content')?.trim();
  if (checks.ogImage) score += 5;

  // H1 (10)
  checks.h1 = $('h1').length > 0 && !!$('h1').first().text().trim();
  if (checks.h1) score += 10;

  // Content > 500 chars (20)
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  checks.contentLength = bodyText.length > 500;
  if (checks.contentLength) score += 20;

  // Blog link (10)
  const allHrefs: string[] = [];
  $('a[href]').each((_, el) => {
    allHrefs.push(($(el).attr('href') || '').toLowerCase());
  });
  checks.blogLink = allHrefs.some(
    (h) => h.includes('/blog') || h.includes('/articles') || h.includes('/news'),
  );
  if (checks.blogLink) score += 10;

  // FAQ link (5)
  checks.faqLink = allHrefs.some(
    (h) => h.includes('/faq') || h.includes('#faq') || h.includes('/help') || h.includes('/support'),
  );
  if (checks.faqLink) score += 5;

  // Detect SPA
  const isSpa = bodyText.length < 200 && $('script').length > 5;

  return {
    score: Math.min(score, 100),
    detail: { checks, isSpa, bodyTextLength: bodyText.length },
  };
}
