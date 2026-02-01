import { Hono } from "hono";
import * as cheerio from "cheerio";
import type { Context } from "hono";

const nineanimeRouter = new Hono();

const BASE_URL = "https://9anime.to";

// Search endpoint
nineanimeRouter.get("/search", async (c: Context) => {
  try {
    const query = c.req.query("q");
    const page = c.req.query("page") || "1";

    if (!query) {
      return c.json({ success: false, error: "Query parameter is required" }, 400);
    }

    const searchUrl = `${BASE_URL}/filter?keyword=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    $("div.flw-item").each((_index, element) => {
      const $el = $(element);
      const id = $el.find("a.film-poster-ahref").attr("href")?.split("/").pop() || "";
      const title = $el.find("h3.film-name a").text().trim();
      const poster = $el.find("img.film-poster-img").attr("data-src") || $el.find("img.film-poster-img").attr("src") || "";
      const type = $el.find("div.film-poster span.fdi-item:first").text().trim();
      const episodes = $el.find("div.film-poster span.fdi-item:last").text().trim();

      if (id && title) {
        results.push({
          id,
          title,
          poster,
          type,
          episodes,
          url: `${BASE_URL}/watch/${id}`,
        });
      }
    });

    return c.json({
      success: true,
      data: results,
      page: parseInt(page),
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to search anime",
      },
      500
    );
  }
});

// Trending endpoint
nineanimeRouter.get("/trending", async (c: Context) => {
  try {
    const page = c.req.query("page") || "1";
    const trendingUrl = `${BASE_URL}/filter?sort=trending&page=${page}`;

    const response = await fetch(trendingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    $("div.flw-item").each((_index, element) => {
      const $el = $(element);
      const id = $el.find("a.film-poster-ahref").attr("href")?.split("/").pop() || "";
      const title = $el.find("h3.film-name a").text().trim();
      const poster = $el.find("img.film-poster-img").attr("data-src") || $el.find("img.film-poster-img").attr("src") || "";
      const type = $el.find("div.film-poster span.fdi-item:first").text().trim();

      if (id && title) {
        results.push({ id, title, poster, type, url: `${BASE_URL}/watch/${id}` });
      }
    });

    return c.json({ success: true, data: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Latest endpoint
nineanimeRouter.get("/latest", async (c: Context) => {
  try {
    const page = c.req.query("page") || "1";
    const latestUrl = `${BASE_URL}/filter?sort=recently_updated&page=${page}`;

    const response = await fetch(latestUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    $("div.flw-item").each((_index, element) => {
      const $el = $(element);
      const id = $el.find("a.film-poster-ahref").attr("href")?.split("/").pop() || "";
      const title = $el.find("h3.film-name a").text().trim();
      const poster = $el.find("img.film-poster-img").attr("data-src") || $el.find("img.film-poster-img").attr("src") || "";

      if (id && title) {
        results.push({ id, title, poster, url: `${BASE_URL}/watch/${id}` });
      }
    });

    return c.json({ success: true, data: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Info endpoint
nineanimeRouter.get("/info/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    const infoUrl = `${BASE_URL}/watch/${id}`;

    const response = await fetch(infoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("h1.film-name").text().trim();
    const poster = $("img.film-poster-img").attr("src") || "";
    const description = $("div.film-description").text().trim();
    const type = $("span.item:contains('Type:')").next().text().trim();
    const status = $("span.item:contains('Status:')").next().text().trim();

    const episodes: any[] = [];
    $("div.episodes-ul li a").each((_index, element) => {
      const $ep = $(element);
      const epId = $ep.attr("href")?.split("/").pop() || "";
      const epNumber = $ep.text().trim();

      if (epId) {
        episodes.push({
          id: epId,
          number: epNumber,
          url: `${BASE_URL}/watch/${id}/${epId}`,
        });
      }
    });

    return c.json({
      success: true,
      data: {
        id,
        title,
        poster,
        description,
        type,
        status,
        episodes,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Episode sources endpoint
nineanimeRouter.get("/episode/sources", async (c: Context) => {
  try {
    const id = c.req.query("id");
    const episodeId = c.req.query("ep");

    if (!id || !episodeId) {
      return c.json(
        {
          success: false,
          error: "Both 'id' and 'ep' parameters are required",
        },
        400
      );
    }

    const episodeUrl = `${BASE_URL}/watch/${id}/${episodeId}`;

    const response = await fetch(episodeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const iframeSrc =
      $("iframe.video-container").attr("src") ||
      $('iframe[src*="nineanime"]').attr("src") ||
      "";

    if (!iframeSrc) {
      return c.json(
        {
          success: false,
          error: "No video source found",
        },
        404
      );
    }

    const sources = [
      {
        url: iframeSrc.startsWith("http") ? iframeSrc : `https:${iframeSrc}`,
        quality: "default",
        isM3U8: iframeSrc.includes(".m3u8"),
      },
    ];

    return c.json({
      success: true,
      data: {
        sources,
        subtitles: [],
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { nineanimeRouter };
