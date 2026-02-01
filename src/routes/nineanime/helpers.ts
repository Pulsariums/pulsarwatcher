import * as cheerio from "cheerio";

const BASE_URL = "https://9animetv.to";
const SITE_URL = "https://nineanime.com";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
};

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": DEFAULT_HEADERS["User-Agent"],
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }

  return await res.text();
}

export async function fetchAjax(
  url: string,
  referer?: string
): Promise<string> {
  const res = await fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      ...(referer && { Referer: referer }),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }

  return await res.text();
}

export async function fetchAjaxJson(
  url: string,
  referer?: string
): Promise<any> {
  const res = await fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      ...(referer && { Referer: referer }),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }

  return await res.json();
}

export { BASE_URL, SITE_URL, DEFAULT_HEADERS };
