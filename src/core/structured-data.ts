import * as cheerio from 'cheerio';
import type { DimensionResult } from '../types.js';

const RECOMMENDED_SCHEMAS = [
  'Organization',
  'WebSite',
  'Product',
  'FAQPage',
  'Article',
  'BreadcrumbList',
];

export { RECOMMENDED_SCHEMAS };

export function checkStructuredData(
  html: string,
  fetchError: string,
): DimensionResult {
  if (!html) {
    return {
      score: 0,
      detail: { error: fetchError || 'Could not fetch homepage', items: [] },
    };
  }

  const $ = cheerio.load(html);
  let score = 0;

  // Check JSON-LD
  const jsonLdScripts: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) jsonLdScripts.push(text);
  });

  const hasJsonLd = jsonLdScripts.length > 0;
  if (hasJsonLd) score += 30;

  // Check recommended types
  const foundTypes = new Set<string>();
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script);
      extractSchemaTypes(data, foundTypes);
    } catch {
      /* skip invalid JSON-LD */
    }
  }

  if (foundTypes.has('BlogPosting') || foundTypes.has('NewsArticle')) {
    foundTypes.add('Article');
  }
  const matchedTypes = RECOMMENDED_SCHEMAS.filter((t) => foundTypes.has(t));
  const typeRatio = RECOMMENDED_SCHEMAS.length
    ? matchedTypes.length / RECOMMENDED_SCHEMAS.length
    : 0;
  score += Math.round(typeRatio * 70);

  // Check meta tags
  const metaResults: Record<string, boolean> = {};
  metaResults['title'] = !!$('title').text().trim();
  metaResults['description'] = !!$('meta[name="description"]').attr('content')?.trim();
  metaResults['og:title'] = !!$('meta[property="og:title"]').attr('content')?.trim();
  metaResults['og:description'] = !!$('meta[property="og:description"]').attr('content')?.trim();
  metaResults['og:image'] = !!$('meta[property="og:image"]').attr('content')?.trim();

  return {
    score: Math.min(score, 100),
    detail: {
      hasJsonLd,
      jsonLdCount: jsonLdScripts.length,
      foundTypes: Array.from(foundTypes),
      matchedRecommendedTypes: matchedTypes,
      metaTags: metaResults,
    },
  };
}

function extractSchemaTypes(data: unknown, types: Set<string>) {
  if (Array.isArray(data)) {
    data.forEach((item) => extractSchemaTypes(item, types));
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj['@type'] === 'string') {
      types.add(obj['@type']);
    } else if (Array.isArray(obj['@type'])) {
      (obj['@type'] as string[]).forEach((t) => types.add(t));
    }
    if (Array.isArray(obj['@graph'])) {
      (obj['@graph'] as unknown[]).forEach((item) =>
        extractSchemaTypes(item, types),
      );
    }
  }
}
