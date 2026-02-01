import { Context } from "hono";
import * as cheerio from "cheerio";
import { fetchHtml, SITE_URL } from "./helpers.js";
import { parseAnimeCards } from "./parsers.js";

export async function searchAnime(c: Context) {
  try {
    const query = c.req.query("q");
    const page = c.req.query("page") || "1";

    if (!query) {
      return c.json({ error: "Missing query parameter" }, 400);
    }

    const url = `${SITE_URL}/search?keyword=${encodeURIComponent(
      query
    )}&page=${page}`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

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
}

export async function getTrending(c: Context) {
  try {
    const page = c.req.query("page") || "1";

    // NineAnime trending sayfası JavaScript ile yüklendiği için
    // filter endpoint'ini kullanıyoruz (sort=trending)
    const url = `${SITE_URL}/filter?sort=trending&page=${page}`;
    const html = await fetchHtml(url);
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
        error: error.message || "Failed to fetch trending",
      },
      500
    );
  }
}

export async function getLatest(c: Context) {
  try {
    const page = c.req.query("page") || "1";

    // NineAnime latest sayfası JavaScript ile yüklendiği için
    // filter endpoint'ini kullanıyoruz (sort=recently_updated)
    const url = `${SITE_URL}/filter?sort=recently_updated&page=${page}`;
    const html = await fetchHtml(url);
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
        error: error.message || "Failed to fetch latest",
      },
      500
    );
  }
}

export async function getPopular(c: Context) {
  try {
    const page = c.req.query("page") || "1";

    // Most popular anime (sort by popularity/views)
    const url = `${SITE_URL}/filter?sort=most_viewed&page=${page}`;
    const html = await fetchHtml(url);
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
        error: error.message || "Failed to fetch popular",
      },
      500
    );
  }
}

export async function getSeasonal(c: Context) {
  try {
    const page = c.req.query("page") || "1";
    const season = c.req.query("season") || getCurrentSeason();
    const year = c.req.query("year") || new Date().getFullYear().toString();

    // Seasonal anime (filter by season and year)
    const url = `${SITE_URL}/filter?season=${season}&year=${year}&page=${page}`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const animes = parseAnimeCards($);

    return c.json({
      success: true,
      data: animes,
      season,
      year,
      page: parseInt(page),
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to fetch seasonal",
      },
      500
    );
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 3) return "winter";
  if (month >= 4 && month <= 6) return "spring";
  if (month >= 7 && month <= 9) return "summer";
  return "fall";
}
