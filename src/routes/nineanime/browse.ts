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
