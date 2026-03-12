# rankweave-site-audit

[🇨🇳 中文文档](./README.zh-CN.md)

> **The first open-source library focused on GEO (Generative Engine Optimization) auditing** — from [RankWeave](https://rankweave.top), the AI Visibility Engine.

Check how well your website is optimized for AI search engines like ChatGPT, Gemini, Claude, Perplexity, and DeepSeek.

This package powers the **Site Technical Audit** in [RankWeave](https://rankweave.top/try). Try it free — no signup required.

---

## Why GEO Matters

Traditional SEO optimizes for Google's link-based ranking. **GEO optimizes for AI-generated answers.**

When someone asks ChatGPT _"What's the best project management tool?"_, the AI pulls from crawled content, structured data, and knowledge graphs to form its answer. If your site blocks AI crawlers or lacks structured data, **your brand is invisible to AI search**.

This library audits the 4 technical dimensions that determine whether AI engines can discover, understand, and cite your brand.

## Install

```bash
npm install rankweave-site-audit
```

Requires Node.js >= 18.0.0

## Usage

```typescript
import { audit } from 'rankweave-site-audit';

const result = await audit({
  domain: 'example.com',
  companyName: 'Example Inc',  // optional, for knowledge graph lookup
  timeout: 10000,              // optional, default 10000ms
  onProgress: (event) => {     // optional
    console.log(`${event.step} ${event.completed}/${event.total}`);
  },
});

console.log(result.overallScore);       // 0-100
console.log(result.dimensions);         // 4 dimension scores & details
console.log(result.recommendations);    // bilingual action items
```

## API

### `audit(options): Promise<AuditResult>`

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domain` | `string` | *required* | Domain to audit (e.g. `"example.com"`) |
| `companyName` | `string` | domain | Brand name for knowledge graph search |
| `timeout` | `number` | `10000` | HTTP request timeout in ms |
| `onProgress` | `function` | — | Progress callback `(event) => void` |

#### AuditResult

```typescript
interface AuditResult {
  domain: string;
  overallScore: number;  // 0-100
  dimensions: {
    crawlerAccess: DimensionResult;    // weight: 30%
    structuredData: DimensionResult;   // weight: 25%
    knowledgeGraph: DimensionResult;   // weight: 20%
    contentBasics: DimensionResult;    // weight: 25%
  };
  recommendations: Recommendation[];
}

interface DimensionResult {
  score: number;  // 0-100
  detail: Record<string, unknown>;
}

interface Recommendation {
  priority: 'high' | 'medium';
  category: 'crawlerAccess' | 'structuredData' | 'knowledgeGraph' | 'contentBasics';
  action_en: string;  // English action item
  action_zh: string;  // Chinese action item
}
```

## Scoring Algorithm

**Overall Score** = Crawler Access × 30% + Structured Data × 25% + Knowledge Graph × 20% + Content Basics × 25%

### 1. Crawler Access (30%)

Checks `robots.txt` for 9 major AI crawlers:

`GPTBot` · `ChatGPT-User` · `OAI-SearchBot` · `ClaudeBot` · `Claude-Web` · `Google-Extended` · `PerplexityBot` · `Bytespider` · `CCBot`

**Score** = (allowed / 9) × 100

**GEO Impact:** If AI crawlers are blocked, your content is invisible to AI search engines. 65% of websites have misconfigured `robots.txt` that blocks AI crawlers without realizing it.

### 2. Structured Data (25%)

| Check | Points |
|-------|--------|
| JSON-LD presence | 30 |
| Schema type coverage¹ | up to 70 |

¹ Recommended types: `Organization`, `WebSite`, `Product`, `FAQPage`, `Article`, `BreadcrumbList`

**GEO Impact:** Structured data helps AI engines understand entities, relationships, and content meaning — enabling accurate citations rather than hallucinated mentions.

### 3. Knowledge Graph (20%)

| Source | Points |
|--------|--------|
| Wikidata | 40 |
| Wikipedia (EN) | 25 |
| Wikipedia (ZH) | 20 |
| Baidu Baike | 15 |

**GEO Impact:** AI models use knowledge graphs as ground truth for factual answers. Brands with Wikidata/Wikipedia entries get cited more frequently and more accurately.

### 4. Content Basics (25%)

| Check | Points |
|-------|--------|
| HTTPS | 10 |
| `<title>` tag | 15 |
| Meta description | 15 |
| Open Graph tags | 10 |
| OG image | 5 |
| H1 heading | 10 |
| Body content > 500 chars | 20 |
| Blog/articles link | 10 |
| FAQ/help link | 5 |

**GEO Impact:** Content quality determines whether AI can extract useful information. Thin pages, missing metadata, and no blog/FAQ means less content for AI to learn from and cite.

## Want More Than Technical Audit?

[**RankWeave**](https://rankweave.top) also diagnoses your brand's actual visibility across ChatGPT, Gemini, Claude, and more. [Try it free →](https://rankweave.top/try)

## License

MIT © [RankWeave](https://rankweave.top)
