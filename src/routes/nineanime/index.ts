import { Router } from "hono";
import { searchAnime, getTrending, getLatest } from "./browse";
import { getAnimeInfo, getEpisodesList } from "./info";
import { getEpisodeLink, getEpisodeSources } from "./sources";

const nineanimeRouter = new Router();

// Root endpoint - API documentation
nineanimeRouter.get("/", (c) => {
  return c.json({
    provider: "NineAnime",
    status: 200,
    message: "NineAnime Scraper API - Modular Structure",
    endpoints: {
      search: "/api/v1/nineanime/search?q=query&page=1",
      trending: "/api/v1/nineanime/trending?page=1",
      latest: "/api/v1/nineanime/latest?page=1",
      info: "/api/v1/nineanime/info/:id",
      episodes: "/api/v1/nineanime/episodes/:id",
      episodeLink: "/api/v1/nineanime/episode/:id/:ep",
      episodeSources: "/api/v1/nineanime/episode/sources?id=:id&ep=:ep",
    },
    features: [
      "Search anime by keyword",
      "Browse trending anime",
      "Get latest episodes",
      "Fetch anime details",
      "List all episodes for an anime",
      "Get direct episode video link",
      "Get episode sources with multiple servers",
    ],
  });
});

// Browse endpoints
nineanimeRouter.get("/search", searchAnime);
nineanimeRouter.get("/trending", getTrending);
nineanimeRouter.get("/latest", getLatest);

// Info endpoints
nineanimeRouter.get("/info/:id", getAnimeInfo);
nineanimeRouter.get("/episodes/:id", getEpisodesList);

// Sources endpoints
nineanimeRouter.get("/episode/:id/:ep", getEpisodeLink);
nineanimeRouter.get("/episode/sources", getEpisodeSources);

export default nineanimeRouter;
