export const USER_AGENTS = {
    chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
};

export async function fetchWithHeaders(url: string, baseUrl: string, userAgent = USER_AGENTS.chrome): Promise<Response> {
    return fetch(url, {
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": baseUrl,
            "Origin": baseUrl,
        },
    });
}

export async function fetchHtml(url: string, baseUrl: string): Promise<string> {
    const response = await fetchWithHeaders(url, baseUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}

export async function fetchJson<T = any>(url: string, baseUrl: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            "User-Agent": USER_AGENTS.chrome,
            "Accept": "application/json, text/plain, */*",
            "Referer": baseUrl,
            "Origin": baseUrl,
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

export function extractIdFromUrl(url: string, pattern?: RegExp): string {
    if (pattern) {
        const match = url.match(pattern);
        return match ? match[1] : "";
    }
    return url.split("/").filter(Boolean).pop() || "";
}

export function normalizeUrl(url: string, baseUrl: string): string {
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
}

export function sanitizeString(str: string): string {
    return str.replace(/\s+/g, " ").trim();
}
