export const NINEANIME_CONFIG = {
    BASE_URL: "https://9animetv.to",
    AJAX_URL: "https://9animetv.to/ajax",
    USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
} as const;

export const ENDPOINTS = {
    search: "/filter",
    trending: "/filter?sort=trending",
    latest: "/filter?sort=recently_updated",
    info: "/watch",
    episodes: "/ajax/episode/list",
    servers: "/ajax/server/list",
    sources: "/ajax/server",
} as const;
