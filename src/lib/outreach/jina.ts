/**
 * Thin client for the Jina AI Search Foundation APIs.
 * Get a key for free: https://jina.ai/?sui=apikey
 */

const READER_ENDPOINT = "https://r.jina.ai/";
const SEARCH_ENDPOINT = "https://s.jina.ai/";

const READ_TIMEOUT_MS = 45_000;
const SEARCH_TIMEOUT_MS = 30_000;

export type ReadPageResult = {
  url: string;
  title: string;
  description: string;
  content: string;
};

export type SearchHit = {
  title: string;
  url: string;
  description: string;
  date: string | null;
};

export class JinaConfigError extends Error {}

function apiKey(): string {
  const key = process.env.JINA_API_KEY?.trim();
  if (!key) {
    throw new JinaConfigError(
      "JINA_API_KEY ontbreekt. Zet de key in je environment om venue-onderzoek te gebruiken.",
    );
  }
  return key;
}

function baseHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Normalises user-entered URLs (the CRM stores them without a scheme sometimes). */
export function normaliseUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}

/**
 * Reads a single URL and returns it as markdown. Returns null on any failure so
 * a single dead link never breaks a research run.
 */
export async function readPage(
  url: string,
  options: { maxChars?: number; noCache?: boolean } = {},
): Promise<ReadPageResult | null> {
  const target = normaliseUrl(url);
  if (!target) return null;

  const maxChars = options.maxChars ?? 14_000;

  try {
    const response = await fetch(READER_ENDPOINT, {
      method: "POST",
      headers: {
        ...baseHeaders(),
        "X-Return-Format": "markdown",
        "X-Retain-Images": "none",
        "X-Timeout": "30",
        ...(options.noCache ? { "X-No-Cache": "true" } : {}),
      },
      body: JSON.stringify({ url: target }),
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      data?: { title?: string; description?: string; url?: string; content?: string };
    };
    const data = payload.data;
    if (!data?.content) return null;

    return {
      url: data.url ?? target,
      title: data.title ?? "",
      description: data.description ?? "",
      content: data.content.slice(0, maxChars),
    };
  } catch (error) {
    if (error instanceof JinaConfigError) throw error;
    return null;
  }
}

/** SERP-style web search. `no-content` keeps the response small and cheap. */
export async function searchWeb(
  query: string,
  options: { num?: number; site?: string } = {},
): Promise<SearchHit[]> {
  try {
    const response = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        ...baseHeaders(),
        "X-Respond-With": "no-content",
        "X-Retain-Images": "none",
        ...(options.site ? { "X-Site": options.site } : {}),
      },
      body: JSON.stringify({
        q: query,
        gl: "NL",
        hl: "nl",
        num: options.num ?? 6,
      }),
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as {
      data?: Array<{
        title?: string;
        url?: string;
        description?: string;
        date?: string;
      }>;
    };

    return (payload.data ?? [])
      .filter((hit): hit is { url: string } & typeof hit => Boolean(hit.url))
      .map((hit) => ({
        title: hit.title ?? "",
        url: hit.url,
        description: hit.description ?? "",
        date: hit.date ?? null,
      }));
  } catch (error) {
    if (error instanceof JinaConfigError) throw error;
    return [];
  }
}

export function hasJinaKey(): boolean {
  return Boolean(process.env.JINA_API_KEY?.trim());
}
