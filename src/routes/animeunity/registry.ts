import { scraperRegistry } from "../../core/ScraperRegistry.js";
import { animeunityRouter } from "./index.js";

scraperRegistry.register({
    id: "animeunity",
    name: "AnimeUnity",
    description: "Italian anime platform scraper",
    status: "active",
    version: "1.0.0",
    baseUrl: "/api/v1/animeunity",
    features: ["search", "info", "episodes", "trending"],
    endpoints: {
        search: "/api/v1/animeunity/search?q={query}",
        info: "/api/v1/animeunity/info/{id}",
        episode: "/api/v1/animeunity/episode/{episodeId}",
        trending: "/api/v1/animeunity/trending",
    },
    router: animeunityRouter,
});
