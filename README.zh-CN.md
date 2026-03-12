# rankweave-geo-audit

[🇬🇧 English](./README.md)

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
npm install rankweave-geo-audit
```

需要 Node.js >= 18.0.0

## 使用

```typescript
import { audit } from 'rankweave-geo-audit';

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

interface DimensionResult {
  score: number;  // 0-100
  detail: Record<string, unknown>;
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

## 不止技术审计？

[**RankWeave**](https://rankweave.top) 还能诊断你的品牌在 ChatGPT、Gemini、Claude 等 AI 搜索引擎中的真实可见度。[免费试用 →](https://rankweave.top/try)

## 许可证

MIT © [RankWeave](https://rankweave.top)
