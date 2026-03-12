import type { DimensionResult, Recommendation } from '../types.js';

const RECOMMENDED_SCHEMAS = [
  'Organization',
  'WebSite',
  'Product',
  'FAQPage',
  'Article',
  'BreadcrumbList',
];

export function generateRecommendations(
  crawlerAccess: DimensionResult,
  structuredData: DimensionResult,
  knowledgeGraph: DimensionResult,
  contentBasics: DimensionResult,
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Crawler access
  const crawlers = crawlerAccess.detail.crawlers as Record<string, boolean> | undefined;
  if (crawlers) {
    const blocked = Object.entries(crawlers)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (blocked.length > 0) {
      recs.push({
        priority: 'high',
        category: 'crawlerAccess',
        action_en: `Unblock AI crawlers in robots.txt: ${blocked.join(', ')}`,
        action_zh: `在 robots.txt 中解除以下 AI 爬虫的屏蔽：${blocked.join('、')}`,
      });
    }
  }

  // Structured data
  if (!structuredData.detail.hasJsonLd) {
    recs.push({
      priority: 'high',
      category: 'structuredData',
      action_en: 'Add JSON-LD structured data to your homepage (Organization, WebSite at minimum)',
      action_zh: '在首页添加 JSON-LD 结构化数据（至少包含 Organization、WebSite 类型）',
    });
  } else {
    const matched = (structuredData.detail.matchedRecommendedTypes as string[]) || [];
    const missing = RECOMMENDED_SCHEMAS.filter((t) => !matched.includes(t));
    if (missing.length > 0) {
      recs.push({
        priority: 'medium',
        category: 'structuredData',
        action_en: `Add missing Schema types: ${missing.join(', ')}`,
        action_zh: `添加缺失的 Schema 类型：${missing.join('、')}`,
      });
    }
  }

  const metaTags = structuredData.detail.metaTags as Record<string, boolean> | undefined;
  if (metaTags) {
    const missingMeta = Object.entries(metaTags)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missingMeta.length > 0) {
      recs.push({
        priority: 'medium',
        category: 'structuredData',
        action_en: `Add missing meta tags: ${missingMeta.join(', ')}`,
        action_zh: `添加缺失的 Meta 标签：${missingMeta.join('、')}`,
      });
    }
  }

  // Knowledge graph
  const sources = knowledgeGraph.detail.sources as Record<string, boolean> | undefined;
  if (sources) {
    if (!sources.wikidata && !sources.wikipedia_en) {
      recs.push({
        priority: 'medium',
        category: 'knowledgeGraph',
        action_en: 'Create or claim your Wikidata entity and Wikipedia page to improve AI knowledge graph coverage',
        action_zh: '创建或认领你的 Wikidata 实体和 Wikipedia 页面，提升 AI 知识图谱覆盖率',
      });
    }
  }

  // Content basics
  const checks = contentBasics.detail.checks as Record<string, boolean> | undefined;
  if (checks) {
    if (!checks.https) {
      recs.push({
        priority: 'high',
        category: 'contentBasics',
        action_en: 'Enable HTTPS for your website',
        action_zh: '为网站启用 HTTPS',
      });
    }
    if (!checks.title) {
      recs.push({
        priority: 'high',
        category: 'contentBasics',
        action_en: 'Add a descriptive <title> tag to your homepage',
        action_zh: '为首页添加描述性的 <title> 标签',
      });
    }
    if (!checks.metaDescription) {
      recs.push({
        priority: 'high',
        category: 'contentBasics',
        action_en: 'Add a meta description to your homepage',
        action_zh: '为首页添加 meta description 描述',
      });
    }
    if (!checks.blogLink) {
      recs.push({
        priority: 'medium',
        category: 'contentBasics',
        action_en: 'Add a blog or articles section to provide fresh, indexable content',
        action_zh: '添加博客或文章板块，提供持续更新的可索引内容',
      });
    }
    if (!checks.contentLength) {
      recs.push({
        priority: 'medium',
        category: 'contentBasics',
        action_en: 'Add more text content to your homepage (at least 500 characters)',
        action_zh: '增加首页文字内容（至少 500 字）',
      });
    }
  }

  // Sort: high first
  recs.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return 0;
  });

  return recs;
}
