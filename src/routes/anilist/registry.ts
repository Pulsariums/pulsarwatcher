import { scraperRegistry } from "../../core/ScraperRegistry.js";
import { anilistRouter } from "./index.js";

scraperRegistry.register({
    id: "anilist",
    name: "AniList",
    description: "Official AniList API wrapper for anime information and metadata",
    version: "1.0.0",
    status: "active",
    baseUrl: "/api/v1/anilist",
    features: ["search", "info", "trending", "popular", "schedule"],
    endpoints: {
        search: "/api/v1/anilist/search?q={query}&page={page}&perPage={perPage}",
        info: "/api/v1/anilist/info/{id}",
        trending: "/api/v1/anilist/trending?page={page}&perPage={perPage}",
        popular: "/api/v1/anilist/popular?page={page}&perPage={perPage}",
        schedule: "/api/v1/anilist/schedule?page={page}&perPage={perPage}",
    },
    router: anilistRouter,
});
