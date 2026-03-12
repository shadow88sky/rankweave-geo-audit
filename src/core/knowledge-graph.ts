import type { DimensionResult } from '../types.js';
import { fetchWithTimeout } from './http.js';

const SCORE_MAP: Record<string, number> = {
  wikidata: 40,
  wikipedia_en: 25,
  wikipedia_zh: 20,
  baidu_baike: 15,
};

export async function checkKnowledgeGraph(
  searchTerm: string,
  timeout: number,
): Promise<DimensionResult> {
  const encoded = encodeURIComponent(searchTerm);
  const sources: Record<string, boolean> = {
    wikidata: false,
    wikipedia_en: false,
    wikipedia_zh: false,
    baidu_baike: false,
  };

  const checks = [
    // Wikidata (40 points)
    fetchWithTimeout(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encoded}&language=en&limit=3&format=json`,
      timeout,
    )
      .then((body) => {
        try {
          const data = JSON.parse(body);
          if (data.search && data.search.length > 0) {
            sources.wikidata = true;
          }
        } catch {}
      })
      .catch(() => {}),

    // Wikipedia EN (25 points)
    fetchWithTimeout(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=3&format=json`,
      timeout,
    )
      .then((body) => {
        try {
          const data = JSON.parse(body);
          if (data.query?.search?.length > 0) {
            sources.wikipedia_en = true;
          }
        } catch {}
      })
      .catch(() => {}),

    // Wikipedia ZH (20 points)
    fetchWithTimeout(
      `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=3&format=json`,
      timeout,
    )
      .then((body) => {
        try {
          const data = JSON.parse(body);
          if (data.query?.search?.length > 0) {
            sources.wikipedia_zh = true;
          }
        } catch {}
      })
      .catch(() => {}),

    // Baidu Baike (15 points)
    fetchWithTimeout(
      `https://baike.baidu.com/item/${encoded}`,
      timeout,
    )
      .then((body) => {
        if (body && (body.includes('lemmaTitle') || body.includes('lemmaTitleH1'))) {
          sources.baidu_baike = true;
        }
      })
      .catch(() => {}),
  ];

  await Promise.allSettled(checks);

  let score = 0;
  for (const [key, found] of Object.entries(sources)) {
    if (found) score += SCORE_MAP[key] || 0;
  }

  return {
    score: Math.min(score, 100),
    detail: { sources },
  };
}
