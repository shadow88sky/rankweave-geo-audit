import type { DimensionResult } from '../types.js';
import { fetchWithTimeout } from './http.js';

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Google-Extended',
  'PerplexityBot',
  'Bytespider',
  'CCBot',
];

export { AI_CRAWLERS };

export async function checkCrawlerAccess(
  domain: string,
  timeout: number,
): Promise<DimensionResult> {
  let robotsTxt = '';
  let robotsFound = false;
  let fetchError = '';

  try {
    robotsTxt = await fetchWithTimeout(`https://${domain}/robots.txt`, timeout);
    robotsFound = true;
  } catch {
    try {
      robotsTxt = await fetchWithTimeout(`http://${domain}/robots.txt`, timeout);
      robotsFound = true;
    } catch (e: unknown) {
      fetchError = e instanceof Error ? e.message : 'Failed to fetch robots.txt';
    }
  }

  if (!robotsFound || !robotsTxt.trim()) {
    return {
      score: 100,
      detail: {
        robotsFound: false,
        reason: fetchError || 'robots.txt not found — all crawlers allowed',
        crawlers: AI_CRAWLERS.reduce(
          (acc, c) => ({ ...acc, [c]: true }),
          {} as Record<string, boolean>,
        ),
        allowedCount: AI_CRAWLERS.length,
        totalCount: AI_CRAWLERS.length,
      },
    };
  }

  const lines = robotsTxt.split('\n').map((l) => l.trim().toLowerCase());
  const crawlerStatus: Record<string, boolean> = {};

  for (const crawler of AI_CRAWLERS) {
    crawlerStatus[crawler] = !isCrawlerBlocked(lines, crawler.toLowerCase());
  }

  const allowedCount = Object.values(crawlerStatus).filter(Boolean).length;
  const score = Math.round((allowedCount / AI_CRAWLERS.length) * 100);

  return {
    score,
    detail: {
      robotsFound: true,
      crawlers: crawlerStatus,
      allowedCount,
      totalCount: AI_CRAWLERS.length,
    },
  };
}

function isCrawlerBlocked(lines: string[], crawlerLower: string): boolean {
  let inSection = false;
  let inWildcard = false;

  for (const line of lines) {
    if (line.startsWith('user-agent:')) {
      const agent = line.replace('user-agent:', '').trim();
      if (agent === crawlerLower) {
        inSection = true;
        inWildcard = false;
      } else if (agent === '*') {
        inWildcard = true;
        inSection = false;
      } else {
        if (inSection) break;
        inWildcard = false;
        inSection = false;
      }
    } else if (line.startsWith('disallow:') && (inSection || inWildcard)) {
      const path = line.replace('disallow:', '').trim();
      if (path === '/' || path === '/*') {
        if (inSection) return true;
        if (inWildcard && !inSection) return true;
      }
    }
  }

  return false;
}
