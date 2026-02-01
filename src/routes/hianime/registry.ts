import { scraperRegistry } from "../../core/ScraperRegistry.js";
import { hianimeRouter } from "./index.js";

scraperRegistry.register({
    id: "hianime",
    name: "HiAnime",
    description: "Primary anime provider with high-quality streams",
    status: "active",
    version: "2.0.0",
    baseUrl: "/api/v1/hianime",
    features: ["search", "home", "info", "episodes", "sources", "categories", "genres"],
    endpoints: {
        home: "/api/v1/hianime/home",
        search: "/api/v1/hianime/search?q={query}&page={page}",
        info: "/api/v1/hianime/anime/{animeId}",
        episodes: "/api/v1/hianime/anime/{animeId}/episodes",
        sources: "/api/v1/hianime/episode/sources?animeEpisodeId={id}",
        category: "/api/v1/hianime/category/{name}?page={page}",
        genre: "/api/v1/hianime/genre/{name}?page={page}",
    },
    router: hianimeRouter,
});
