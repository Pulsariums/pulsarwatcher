import { Hono } from "hono";
import * as cheerio from "cheerio";
import { cache } from "../../config/cache.js";
import type { ServerContext } from "../../config/context.js";
import { log } from "../../config/logger.js";

const gogoanimeRouter = new Hono<ServerContext>();

const BASE_URL = "https://anitaku.pe";
const AJAX_URL = "https://ajax.gogocdn.net/ajax";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface AnimeResult {
    id: string;
    title: string;
    poster?: string;
    url: string;
    releaseDate?: string;
}

interface EpisodeResult {
    id: string;
    number: number;
    url: string;
}

async function fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}

// ========== SEARCH ==========
gogoanimeRouter.get("/search", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const query = c.req.query("q");

    if (!query) {
        return c.json({ provider: "PulsarWatch", status: 400, error: "Missing q parameter" }, 400);
    }

    const data = await cache.getOrSet(async () => {
        log.info(`[GogoAnime] Searching: ${query}`);
        const html = await fetchHtml(`${BASE_URL}/search.html?keyword=${encodeURIComponent(query)}`);
        const $ = cheerio.load(html);

        const results: AnimeResult[] = [];

        $("ul.items li").each((_, elem) => {
            const $li = $(elem);
            const $link = $li.find("p.name a");
            const title = $link.attr("title")?.trim() || "";
            const href = $link.attr("href") || "";
            const poster = $li.find("div.img img").attr("src");
            const releaseDate = $li.find("p.released").text().replace("Released:", "").trim();

            if (href && title) {
                const id = href.replace("/category/", "");
                results.push({
                    id,
                    title,
                    poster,
                    url: `${BASE_URL}${href}`,
                    releaseDate,
                });
            }
        });

        return { results, totalResults: results.length };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== INFO ==========
gogoanimeRouter.get("/info/:id", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const id = c.req.param("id");

    const data = await cache.getOrSet(async () => {
        log.info(`[GogoAnime] Getting info: ${id}`);
        const html = await fetchHtml(`${BASE_URL}/category/${id}`);
        const $ = cheerio.load(html);

        const $infoBody = $("div.anime_info_body_bg");
        const title = $infoBody.find("h1").text().trim();
        const poster = $infoBody.find("img").attr("src");
        
        const info: any = {
            id,
            title,
            poster,
            url: `${BASE_URL}/category/${id}`,
        };

        $infoBody.find("p.type").each((_, elem) => {
            const $p = $(elem);
            const text = $p.text();
            const span = $p.find("span").text().trim();

            if (text.includes("Type:")) {
                info.type = text.replace("Type:", "").trim();
            } else if (text.includes("Plot Summary:")) {
                info.description = text.replace("Plot Summary:", "").trim();
            } else if (text.includes("Genre:")) {
                info.genres = text.replace("Genre:", "").split(",").map(g => g.trim());
            } else if (text.includes("Released:")) {
                info.releaseDate = text.replace("Released:", "").trim();
            } else if (text.includes("Status:")) {
                info.status = text.replace("Status:", "").trim();
            } else if (text.includes("Other name:")) {
                info.otherNames = text.replace("Other name:", "").split(";").map(n => n.trim());
            }
        });

        return info;
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== EPISODES LIST ==========
gogoanimeRouter.get("/episodes/:id", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const id = c.req.param("id");

    const data = await cache.getOrSet(async () => {
        log.info(`[GogoAnime] Getting episodes: ${id}`);
        
        // First get the movie ID from the category page
        const html = await fetchHtml(`${BASE_URL}/category/${id}`);
        const $ = cheerio.load(html);
        
        const movieId = $("#movie_id").attr("value");
        if (!movieId) {
            throw new Error("Movie ID not found");
        }

        // Get episode list from AJAX endpoint
        const lastEpEnd = $("ul#episode_page li:last-child a").attr("ep_end");
        const ajaxUrl = `${AJAX_URL}/load-list-episode?ep_start=0&ep_end=${lastEpEnd}&id=${movieId}`;
        
        const episodeHtml = await fetchHtml(ajaxUrl);
        const $ep = cheerio.load(episodeHtml);

        const episodes: EpisodeResult[] = [];

        $ep("ul#episode_related li").each((_, elem) => {
            const $li = $ep(elem);
            const $link = $li.find("a");
            const href = $link.attr("href")?.trim() || "";
            const episodeNum = $link.find("div.name").text().replace("EP", "").trim();

            if (href) {
                const episodeId = href.replace("/", "");
                episodes.push({
                    id: episodeId,
                    number: parseInt(episodeNum) || 0,
                    url: `${BASE_URL}${href}`,
                });
            }
        });

        return { episodes: episodes.reverse(), totalEpisodes: episodes.length };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== EPISODE SOURCES ==========
gogoanimeRouter.get("/sources/:episodeId", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const episodeId = c.req.param("episodeId");

    const data = await cache.getOrSet(async () => {
        log.info(`[GogoAnime] Getting sources: ${episodeId}`);
        const html = await fetchHtml(`${BASE_URL}/${episodeId}`);
        const $ = cheerio.load(html);

        const sources: any[] = [];

        $("div.anime_muti_link ul li").each((_, elem) => {
            const $li = $(elem);
            const serverName = $li.find("a").text().trim();
            const dataVideo = $li.find("a").attr("data-video");

            if (dataVideo) {
                sources.push({
                    server: serverName,
                    url: dataVideo.startsWith("http") ? dataVideo : `https:${dataVideo}`,
                });
            }
        });

        return { sources };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== RECENT RELEASES ==========
gogoanimeRouter.get("/recent", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const page = c.req.query("page") || "1";

    const data = await cache.getOrSet(async () => {
        log.info(`[GogoAnime] Getting recent releases: page ${page}`);
        const html = await fetchHtml(`${AJAX_URL}/page-recent-release.html?page=${page}&type=1`);
        const $ = cheerio.load(html);

        const results: any[] = [];

        $("ul.items li").each((_, elem) => {
            const $li = $(elem);
            const $link = $li.find("p.name a");
            const title = $link.attr("title")?.trim() || "";
            const href = $link.attr("href") || "";
            const poster = $li.find("div.img img").attr("src");
            const episode = $li.find("p.episode").text().trim();

            if (href && title) {
                const episodeId = href.replace("/", "");
                const animeId = episodeId.split("-episode-")[0];
                
                results.push({
                    id: animeId,
                    episodeId,
                    title: title.replace(episode, "").trim(),
                    episode,
                    poster,
                    url: `${BASE_URL}${href}`,
                });
            }
        });

        return { results, totalResults: results.length };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

export { gogoanimeRouter };
