import { scraperRegistry } from "../../core/ScraperRegistry.js";
import nineanimeRouter from "./index.js";

scraperRegistry.register({
    id: "nineanime",
    name: "NineAnime",
    description: "Popular anime streaming scraper with extensive library",
    status: "active",
    version: "2.0.0",
    baseUrl: "/api/v1/nineanime",
    features: ["search", "trending", "latest", "popular", "info", "episodes", "sources"],
    endpoints: {
        search: "/api/v1/nineanime/search?q={query}&page={page}",
        trending: "/api/v1/nineanime/trending?page={page}",
        latest: "/api/v1/nineanime/latest?page={page}",
        popular: "/api/v1/nineanime/popular?page={page}",
        info: "/api/v1/nineanime/info/{id}",
        episodes: "/api/v1/nineanime/episodes/{id}",
        sources: "/api/v1/nineanime/episode/sources?id={id}&ep={number}",
    },
    router: nineanimeRouter,
});
