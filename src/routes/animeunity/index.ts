import { Hono } from "hono";
import * as cheerio from "cheerio";
import { cache } from "../../config/cache.js";
import type { ServerContext } from "../../config/context.js";
import { log } from "../../config/logger.js";

const animeunityRouter = new Hono<ServerContext>();

const BASE_URL = "https://www.animeunity.so";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface AnimeResult {
    id: string;
    title: string;
    titleEnglish?: string;
    poster?: string;
    type?: string;
    status?: string;
}

async function fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": BASE_URL,
        },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}

// ========== SEARCH ==========
animeunityRouter.get("/search", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const query = c.req.query("q");

    if (!query) {
        return c.json({ provider: "PulsarWatch", status: 400, error: "Missing q parameter" }, 400);
    }

    const data = await cache.getOrSet(async () => {
        log.info(`[AnimeUnity] Searching: ${query}`);
        const html = await fetchHtml(`${BASE_URL}/archivio?title=${encodeURIComponent(query)}`);
        const $ = cheerio.load(html);

        const results: AnimeResult[] = [];

        $(".card.anime-card").each((_, elem) => {
            const $card = $(elem);
            const link = $card.find("a").attr("href");
            const title = $card.find(".anime-title").text().trim();
            const poster = $card.find("img").attr("src");
            const type = $card.find(".anime-type").text().trim();
            
            if (link && title) {
                const id = link.split("/").pop() || "";
                results.push({
                    id,
                    title,
                    poster: poster?.startsWith("http") ? poster : `${BASE_URL}${poster}`,
                    type,
                });
            }
        });

        return { results, totalResults: results.length };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== INFO ==========
animeunityRouter.get("/info/:id", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const id = c.req.param("id");

    const data = await cache.getOrSet(async () => {
        log.info(`[AnimeUnity] Getting info: ${id}`);
        const html = await fetchHtml(`${BASE_URL}/anime/${id}`);
        const $ = cheerio.load(html);

        const title = $("h1.anime-title").text().trim();
        const titleEnglish = $(".anime-title-english").text().trim();
        const poster = $("img.anime-poster").attr("src");
        const description = $(".anime-description").text().trim();
        const type = $(".anime-type").text().trim();
        const status = $(".anime-status").text().trim();
        const rating = $(".anime-rating").text().trim();

        const episodes: any[] = [];
        $(".episode-item").each((_, elem) => {
            const $ep = $(elem);
            const epNum = $ep.find(".episode-number").text().trim();
            const epId = $ep.find("a").attr("href")?.split("/").pop();
            if (epNum && epId) {
                episodes.push({
                    number: parseInt(epNum),
                    id: epId,
                });
            }
        });

        return {
            id,
            title,
            titleEnglish,
            poster: poster?.startsWith("http") ? poster : `${BASE_URL}${poster}`,
            description,
            type,
            status,
            rating,
            episodes,
            totalEpisodes: episodes.length,
        };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== EPISODE SOURCES ==========
animeunityRouter.get("/episode/:id", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const id = c.req.param("id");

    const data = await cache.getOrSet(async () => {
        log.info(`[AnimeUnity] Getting episode sources: ${id}`);
        const html = await fetchHtml(`${BASE_URL}/ep/${id}`);
        const $ = cheerio.load(html);

        const sources: any[] = [];
        
        // Extract video sources
        $("video source, iframe").each((_, elem) => {
            const src = $(elem).attr("src");
            if (src) {
                sources.push({
                    url: src.startsWith("http") ? src : `${BASE_URL}${src}`,
                    quality: "default",
                    type: elem.tagName === "iframe" ? "iframe" : "video",
                });
            }
        });

        return { sources };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== TRENDING ==========
animeunityRouter.get("/trending", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");

    const data = await cache.getOrSet(async () => {
        log.info(`[AnimeUnity] Getting trending`);
        const html = await fetchHtml(`${BASE_URL}`);
        const $ = cheerio.load(html);

        const trending: AnimeResult[] = [];

        $(".trending-anime .anime-card").each((_, elem) => {
            const $card = $(elem);
            const link = $card.find("a").attr("href");
            const title = $card.find(".anime-title").text().trim();
            const poster = $card.find("img").attr("src");
            
            if (link && title) {
                const id = link.split("/").pop() || "";
                trending.push({
                    id,
                    title,
                    poster: poster?.startsWith("http") ? poster : `${BASE_URL}${poster}`,
                });
            }
        });

        return { trending };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== ROOT ==========
animeunityRouter.get("/", (c) => {
    return c.json({
        provider: "PulsarWatch",
        status: 200,
        message: "AnimeUnity Scraper API",
        endpoints: {
            search: "/api/v1/animeunity/search?q={query}",
            info: "/api/v1/animeunity/info/{id}",
            episode: "/api/v1/animeunity/episode/{episodeId}",
            trending: "/api/v1/animeunity/trending",
        },
    });
});

export { animeunityRouter };
