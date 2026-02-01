import { NINEANIME_CONFIG } from "./config.js";

export async function fetchNineAnimeHtml(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            "User-Agent": NINEANIME_CONFIG.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": NINEANIME_CONFIG.BASE_URL,
        },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}

export async function fetchNineAnimeJson<T = any>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            "User-Agent": NINEANIME_CONFIG.USER_AGENT,
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": NINEANIME_CONFIG.BASE_URL,
        },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

export function buildSearchUrl(query: string, page = 1): string {
    return `${NINEANIME_CONFIG.BASE_URL}/filter?keyword=${encodeURIComponent(query)}&page=${page}`;
}

export function buildInfoUrl(id: string): string {
    return `${NINEANIME_CONFIG.BASE_URL}/watch/${id}`;
}

export function buildEpisodesUrl(animeId: string): string {
    return `${NINEANIME_CONFIG.AJAX_URL}/episode/list/${animeId}`;
}

export function buildSourcesUrl(episodeId: string): string {
    return `${NINEANIME_CONFIG.AJAX_URL}/server/${episodeId}`;
}
