import { Hono } from "hono";
import { cache } from "../../config/cache.js";
import type { ServerContext } from "../../config/context.js";
import { log } from "../../config/logger.js";

const anilistRouter = new Hono<ServerContext>();

const ANILIST_API = "https://graphql.anilist.co";

interface AniListAnime {
    id: number;
    title: {
        romaji?: string;
        english?: string;
        native?: string;
    };
    coverImage?: {
        large?: string;
        medium?: string;
    };
    bannerImage?: string;
    format?: string;
    status?: string;
    episodes?: number;
    season?: string;
    seasonYear?: number;
    averageScore?: number;
    genres?: string[];
}

async function queryAniList(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(ANILIST_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
}

// ========== SEARCH ==========
anilistRouter.get("/search", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const query = c.req.query("q");
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(c.req.query("perPage") || "20");

    if (!query) {
        return c.json({ provider: "PulsarWatch", status: 400, error: "Missing q parameter" }, 400);
    }

    const data = await cache.getOrSet(async () => {
        log.info(`[AniList] Searching: ${query}`);

        const gqlQuery = `
            query ($search: String, $page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        coverImage {
                            large
                            medium
                        }
                        bannerImage
                        format
                        status
                        episodes
                        season
                        seasonYear
                        averageScore
                        genres
                    }
                }
            }
        `;

        const result = await queryAniList(gqlQuery, { search: query, page, perPage });

        return {
            results: result.Page.media,
            pageInfo: result.Page.pageInfo,
        };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== INFO ==========
anilistRouter.get("/info/:id", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const id = parseInt(c.req.param("id"));

    if (isNaN(id)) {
        return c.json({ provider: "PulsarWatch", status: 400, error: "Invalid ID" }, 400);
    }

    const data = await cache.getOrSet(async () => {
        log.info(`[AniList] Getting info: ${id}`);

        const gqlQuery = `
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    description
                    coverImage {
                        large
                        extraLarge
                    }
                    bannerImage
                    format
                    status
                    episodes
                    duration
                    season
                    seasonYear
                    startDate {
                        year
                        month
                        day
                    }
                    endDate {
                        year
                        month
                        day
                    }
                    averageScore
                    meanScore
                    popularity
                    favourites
                    genres
                    studios {
                        nodes {
                            name
                        }
                    }
                    relations {
                        edges {
                            relationType
                            node {
                                id
                                title {
                                    romaji
                                }
                                type
                            }
                        }
                    }
                    streamingEpisodes {
                        title
                        thumbnail
                        url
                        site
                    }
                }
            }
        `;

        const result = await queryAniList(gqlQuery, { id });
        return result.Media;
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== TRENDING ==========
anilistRouter.get("/trending", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(c.req.query("perPage") || "20");

    const data = await cache.getOrSet(async () => {
        log.info(`[AniList] Getting trending: page ${page}`);

        const gqlQuery = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    media(type: ANIME, sort: TRENDING_DESC) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        coverImage {
                            large
                        }
                        bannerImage
                        format
                        status
                        episodes
                        averageScore
                        trending
                    }
                }
            }
        `;

        const result = await queryAniList(gqlQuery, { page, perPage });

        return {
            results: result.Page.media,
            pageInfo: result.Page.pageInfo,
        };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== POPULAR ==========
anilistRouter.get("/popular", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(c.req.query("perPage") || "20");

    const data = await cache.getOrSet(async () => {
        log.info(`[AniList] Getting popular: page ${page}`);

        const gqlQuery = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    media(type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        coverImage {
                            large
                        }
                        format
                        status
                        episodes
                        averageScore
                        popularity
                    }
                }
            }
        `;

        const result = await queryAniList(gqlQuery, { page, perPage });

        return {
            results: result.Page.media,
            pageInfo: result.Page.pageInfo,
        };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

// ========== AIRING SCHEDULE ==========
anilistRouter.get("/schedule", async (c) => {
    const cacheConfig = c.get("CACHE_CONFIG");
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(c.req.query("perPage") || "20");

    const data = await cache.getOrSet(async () => {
        log.info(`[AniList] Getting airing schedule: page ${page}`);

        const gqlQuery = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    airingSchedules(sort: TIME) {
                        id
                        airingAt
                        episode
                        media {
                            id
                            title {
                                romaji
                                english
                            }
                            coverImage {
                                large
                            }
                            status
                        }
                    }
                }
            }
        `;

        const result = await queryAniList(gqlQuery, { page, perPage });

        return {
            results: result.Page.airingSchedules,
            pageInfo: result.Page.pageInfo,
        };
    }, cacheConfig.key, cacheConfig.duration);

    return c.json({ provider: "PulsarWatch", status: 200, data });
});

export { anilistRouter };
