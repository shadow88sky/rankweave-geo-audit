<a id="english"></a>

# rankweave-site-audit

[🇨🇳 中文文档](#中文文档)

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

## Beyond Technical Audit — Full AI Visibility

This package covers the **technical foundation** of GEO — whether AI _can_ crawl and understand your site.

But GEO has a second half: **Are AI search engines actually mentioning your brand in their answers?**

[**RankWeave**](https://rankweave.top) is a full AI Visibility Engine that combines:

| Capability | This Package | RankWeave Platform |
|------------|:---:|:---:|
| AI crawler access audit | ✅ | ✅ |
| Structured data check | ✅ | ✅ |
| Knowledge graph check | ✅ | ✅ |
| Content basics audit | ✅ | ✅ |
| Cross-engine AI visibility diagnosis (ChatGPT, Gemini, Claude, DeepSeek, Grok) | — | ✅ |
| Brand sentiment analysis in AI answers | — | ✅ |
| Competitor citation gap analysis | — | ✅ |
| AI-optimized content generation | — | ✅ |
| Multi-platform publishing | — | ✅ |
| Ongoing monitoring & verification | — | ✅ |

👉 **[Try the free GEO health check](https://rankweave.top/try)** — no signup required, results in under 60 seconds.

👉 **[Get full AI visibility analysis](https://rankweave.top)** — see exactly how ChatGPT, Gemini, Claude talk about your brand.

## License

MIT © [RankWeave](https://rankweave.top)

---

<a id="中文文档"></a>

# rankweave-site-audit（中文文档）

[🇬🇧 English](#english)

> **首个专注 GEO（生成式引擎优化）审计的开源库** — 来自 [RankWeave](https://rankweave.top)，AI 可见度引擎。

检测你的网站对 AI 搜索引擎（ChatGPT、Gemini、Claude、Perplexity、DeepSeek）的优化程度。

本包是 [RankWeave](https://rankweave.top/try) **站点技术审计**功能的核心引擎。免费试用，无需注册。

---

## 为什么 GEO 重要？

传统 SEO 优化的是 Google 基于链接的排名。**GEO 优化的是 AI 生成的回答。**

当用户问 ChatGPT「最好的项目管理工具是什么？」，AI 会从爬取的内容、结构化数据和知识图谱中提取信息来组织答案。如果你的网站屏蔽了 AI 爬虫或缺少结构化数据，**你的品牌对 AI 搜索是不可见的**。

本库审计决定 AI 引擎能否发现、理解和引用你的品牌的 4 个技术维度。

## 安装

```bash
npm install rankweave-site-audit
```

需要 Node.js >= 18.0.0

## 使用

```typescript
import { audit } from 'rankweave-site-audit';

const result = await audit({
  domain: 'example.com',
  companyName: 'Example Inc',  // 可选，用于知识图谱搜索
  timeout: 10000,              // 可选，默认 10000ms
  onProgress: (event) => {     // 可选，进度回调
    console.log(`${event.step} ${event.completed}/${event.total}`);
  },
});

console.log(result.overallScore);       // 0-100
console.log(result.dimensions);         // 4 个维度的分数和详情
console.log(result.recommendations);    // 中英双语优化建议
```

## API

### `audit(options): Promise<AuditResult>`

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domain` | `string` | *必填* | 要审计的域名（如 `"example.com"`） |
| `companyName` | `string` | 使用 domain | 品牌名，用于知识图谱搜索 |
| `timeout` | `number` | `10000` | HTTP 请求超时（毫秒） |
| `onProgress` | `function` | — | 进度回调 `(event) => void` |

#### 返回结果

```typescript
interface AuditResult {
  domain: string;
  overallScore: number;  // 0-100
  dimensions: {
    crawlerAccess: DimensionResult;    // 权重 30%
    structuredData: DimensionResult;   // 权重 25%
    knowledgeGraph: DimensionResult;   // 权重 20%
    contentBasics: DimensionResult;    // 权重 25%
  };
  recommendations: Recommendation[];
}

interface Recommendation {
  priority: 'high' | 'medium';
  category: 'crawlerAccess' | 'structuredData' | 'knowledgeGraph' | 'contentBasics';
  action_en: string;  // 英文建议
  action_zh: string;  // 中文建议
}
```

## 评分算法

**综合评分** = 爬虫访问 × 30% + 结构化数据 × 25% + 知识图谱 × 20% + 内容基础 × 25%

### 1. 爬虫访问（30%）

检测 `robots.txt` 对 9 个主流 AI 爬虫的放行状态：

`GPTBot` · `ChatGPT-User` · `OAI-SearchBot` · `ClaudeBot` · `Claude-Web` · `Google-Extended` · `PerplexityBot` · `Bytespider` · `CCBot`

**评分** = (放行数 / 9) × 100

**GEO 影响：** AI 爬虫被屏蔽 = 你的内容无法被 AI 搜索引擎索引。65% 的网站在不知情的情况下通过 `robots.txt` 屏蔽了 AI 爬虫。

### 2. 结构化数据（25%）

| 检查项 | 分值 |
|--------|------|
| JSON-LD 存在 | 30 分 |
| Schema 类型覆盖¹ | 最高 70 分 |

¹ 推荐类型：`Organization`、`WebSite`、`Product`、`FAQPage`、`Article`、`BreadcrumbList`

**GEO 影响：** 结构化数据帮助 AI 理解实体、关系和内容语义 — 让 AI 能够准确引用你的品牌，而不是产生幻觉式的提及。

### 3. 知识图谱（20%）

| 来源 | 分值 |
|------|------|
| Wikidata | 40 分 |
| 英文 Wikipedia | 25 分 |
| 中文 Wikipedia | 20 分 |
| 百度百科 | 15 分 |

**GEO 影响：** AI 模型依赖知识图谱作为事实性回答的真相来源。拥有 Wikidata/Wikipedia 条目的品牌被引用的频率更高、准确性更好。

### 4. 内容基础（25%）

| 检查项 | 分值 |
|--------|------|
| HTTPS | 10 分 |
| `<title>` 标签 | 15 分 |
| Meta description | 15 分 |
| Open Graph 标签 | 10 分 |
| OG 图片 | 5 分 |
| H1 标题 | 10 分 |
| 正文内容 > 500 字 | 20 分 |
| 博客/文章链接 | 10 分 |
| FAQ/帮助链接 | 5 分 |

**GEO 影响：** 内容质量决定 AI 能否提取有效信息。页面内容单薄、缺少元数据、没有博客/FAQ = AI 可学习和引用的内容更少。

## 技术审计之外 — 完整的 AI 可见度方案

本包覆盖 GEO 的**技术基础** — AI 能不能爬取和理解你的网站。

但 GEO 还有另一半：**AI 搜索引擎在回答中是否真的在提及你的品牌？**

[**RankWeave**](https://rankweave.top) 是一个完整的 AI 可见度引擎，对比如下：

| 能力 | 本开源包 | RankWeave 平台 |
|------|:---:|:---:|
| AI 爬虫访问审计 | ✅ | ✅ |
| 结构化数据检测 | ✅ | ✅ |
| 知识图谱检测 | ✅ | ✅ |
| 内容基础审计 | ✅ | ✅ |
| 跨引擎 AI 可见度诊断（ChatGPT、Gemini、Claude、DeepSeek、Grok） | — | ✅ |
| AI 回答中的品牌情感分析 | — | ✅ |
| 竞品引用差距分析 | — | ✅ |
| AI 优化内容生成 | — | ✅ |
| 多平台适配发布 | — | ✅ |
| 持续监测与验证 | — | ✅ |

👉 **[免费 GEO 健康检查](https://rankweave.top/try)** — 无需注册，60 秒出结果。

👉 **[获取完整 AI 可见度分析](https://rankweave.top)** — 查看 ChatGPT、Gemini、Claude 如何谈论你的品牌。

## 许可证

MIT © [RankWeave](https://rankweave.top)
