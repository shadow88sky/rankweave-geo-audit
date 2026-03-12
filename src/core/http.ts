export function normalizeDomain(input: string): string {
  let d = input.trim();
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/\/+$/, '');
  return d;
}

export async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RankWeaveBot/1.0; +https://rankweave.top)',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchHomepage(
  domain: string,
  timeout: number,
): Promise<{ html: string; error: string }> {
  try {
    const html = await fetchWithTimeout(`https://${domain}`, timeout);
    return { html, error: '' };
  } catch {
    try {
      const html = await fetchWithTimeout(`http://${domain}`, timeout);
      return { html, error: '' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch homepage';
      return { html: '', error: msg };
    }
  }
}
