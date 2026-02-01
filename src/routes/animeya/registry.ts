import { scraperRegistry } from "../../core/ScraperRegistry.js";
import { animeyaRouter } from "./index.js";

scraperRegistry.register({
    id: "animeya",
    name: "Animeya",
    description: "Animeya streaming platform integration",
    status: "active",
    version: "1.0.0",
    baseUrl: "/api/v1/animeya",
    features: ["search", "info", "episodes"],
    endpoints: {
        search: "/api/v1/animeya/search?q={query}",
        info: "/api/v1/animeya/info/{id}",
        episodes: "/api/v1/animeya/episodes/{id}",
    },
    router: animeyaRouter,
});
