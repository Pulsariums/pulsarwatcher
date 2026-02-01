import { scraperRegistry } from "../../core/ScraperRegistry.js";
import { gogoanimeRouter } from "./index.js";

scraperRegistry.register({
    id: "gogoanime",
    name: "GogoAnime",
    description: "Popular anime streaming platform with extensive library",
    version: "1.0.0",
    status: "active",
    baseUrl: "/api/v1/gogoanime",
    features: ["search", "info", "episodes", "sources", "recent"],
    endpoints: {
        search: "/api/v1/gogoanime/search?q={query}",
        info: "/api/v1/gogoanime/info/{id}",
        episodes: "/api/v1/gogoanime/episodes/{id}",
        sources: "/api/v1/gogoanime/sources/{episodeId}",
        recent: "/api/v1/gogoanime/recent?page={page}",
    },
    router: gogoanimeRouter,
});
