import { Router } from "hono";
import * as cheerio from "cheerio";

const nineanimeRouter = new Router();

// ============================================
// Endpoints Description
// ============================================

nineanimeRouter.get("/", (c) => {
  return c.json({
    provider: "NineAnime",
    status: 200,
    message: "NineAnime Scraper API",
    endpoints: {
      search: "/api/v1/nineanime/search?q=query",
      trending: "/api/v1/nineanime/trending?page=1",
      latest: "/api/v1/nineanime/latest?page=1",
    },
  });
});

// ============================================
// Helper Functions
// ============================================

interface AnimeCard {
  id: string;
  title: string;
  poster: string;
  type?: string;
  rating?: number;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }

  return await res.text();
}

function parseAnimeCards($: cheerio.CheerioAPI): AnimeCard[] {
  const results: AnimeCard[] = [];

  // NineAnime HTML struktur:
  // <div class="flw-item">
  //   <div class="film-poster">
  //     <img alt="Anime Title" src="poster-url" />
  //   </div>
  //   <div class="film-detail">
  //     <h3 class="film-name">
  //       <a href="/watch/anime-slug">Anime Title</a>
  //     </h3>
  //     <span class="fdi-item">TV</span>
  //   </div>
  // </div>

  $("div.flw-item").each((_, element) => {
    const $el = $(element);

    // ID/Slug'ı çıkar
    const href = $el.find("h3.film-name a").attr("href") || "";
    const idMatch = href.match(/\/watch\/(.+?)$/);
    const id = idMatch ? idMatch[1] : "";

    // Başlık
    const title =
      $el.find("h3.film-name a").attr("title") ||
      $el.find("h3.film-name a").text().trim();

    // Poster
    const poster = $el.find("img.film-poster-img").attr("src") || "";

    // Type (TV, Movie, vb)
    const type = $el.find("span.fdi-item").first().text().trim() || "TV";

    if (id && title && poster) {
      results.push({ id, title, poster, type });
    }
  });

  return results;
}

// ============================================
// Search Endpoint
// ============================================

nineanimeRouter.get("/search", async (c) => {
  try {
    const query = c.req.query("q");
    const page = c.req.query("page") || "1";

    if (!query) {
      return c.json({ error: "Missing query parameter" }, 400);
    }

    // Fetch HTML
    const url = `https://nineanime.com/search?keyword=${encodeURIComponent(
      query
    )}&page=${page}`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // Parse anime'leri
    const animes = parseAnimeCards($);

    return c.json({
      success: true,
      data: animes,
      query,
      page: parseInt(page),
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Search failed",
      },
      500
    );
  }
});

// ============================================
// Trending Endpoint
// ============================================

nineanimeRouter.get("/trending", async (c) => {
  try {
    const page = c.req.query("page") || "1";

    // Fetch trending page
    const html = await fetchHtml(
      `https://nineanime.com/trending?page=${page}`
    );
    const $ = cheerio.load(html);

    const animes = parseAnimeCards($);

    return c.json({
      success: true,
      data: animes,
      page: parseInt(page),
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
});

// ============================================
// Latest Endpoint
// ============================================

nineanimeRouter.get("/latest", async (c) => {
  try {
    const page = c.req.query("page") || "1";

    const html = await fetchHtml(`https://nineanime.com/home?page=${page}`);
    const $ = cheerio.load(html);

    const animes = parseAnimeCards($);

    return c.json({
      success: true,
      data: animes,
      page: parseInt(page),
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
});

// ============================================
// Anime Info Endpoint
// ============================================

nineanimeRouter.get("/info/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Fetch anime detail page
    const html = await fetchHtml(`https://nineanime.com/watch/${id}`);
    const $ = cheerio.load(html);

    // Title
    const title = $("h1.film-title").text().trim();

    // Description
    const description = $("div.film-description p").text().trim();

    // Poster
    const poster = $("img.film-poster").attr("src") || "";

    // Episodes count
    const episodesText = $("div.film-stats span:contains('Episodes')").text();
    const episodesMatch = episodesText.match(/(\d+)/);
    const episodes = episodesMatch ? parseInt(episodesMatch[1]) : 0;

    // Rating
    const ratingText = $("span.film-rating").text();
    const rating = parseFloat(ratingText) || 0;

    const data = {
      id,
      title,
      description,
      poster,
      episodes,
      rating,
      url: `https://nineanime.com/watch/${id}`,
    };

    return c.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
});

// ============================================
// Episode Sources Endpoint
// ============================================

nineanimeRouter.get("/episode/sources", async (c) => {
  try {
    const animeId = c.req.query("id");
    const episodeNumber = c.req.query("ep");

    if (!animeId || !episodeNumber) {
      return c.json({ error: "Missing id or ep parameter" }, 400);
    }

    // Fetch episode page
    const episodeUrl = `https://nineanime.com/watch/${animeId}?ep=${episodeNumber}`;
    const html = await fetchHtml(episodeUrl);
    const $ = cheerio.load(html);

    // Video player'ı bul
    const iframeSrc =
      $("iframe.video-container").attr("src") ||
      $("iframe[src*="nineanime"]").attr("src") ||
      "";

    if (!iframeSrc) {
      return c.json(
        {
          success: false,
          error: "No video source found for this episode",
        },
        404
      );
    }

    // Subtitle tracks
    const tracks: any[] = [];
    $("track[kind='captions']").each((_, el) => {
      const $track = $(el);
      tracks.push({
        file: $track.attr("src"),
        label: $track.attr("label") || "Unknown",
        kind: "captions",
      });
    });

    const sources = [
      {
        url: iframeSrc,
        type: "iframe",
        quality: "auto",
      },
    ];

    return c.json({
      success: true,
      data: {
        animeId,
        episodeNumber,
        sources,
        tracks,
        embedUrl: iframeSrc,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
});

export default nineanimeRouter;
