import { Hono } from "hono";
import * as cheerio from "cheerio";
import type { Context } from "hono";

const nineanimeRouter = new Hono();

const BASE_URL = "https://9animetv.to";

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "X-Requested-With": "XMLHttpRequest",
  Accept: "application/json, text/plain, */*",
};

async function fetchHtml(url: string, referer?: string) {
  const response = await fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      ...(referer ? { Referer: referer } : {}),
    },
  });
  return response.text();
}

async function fetchHtmlWithCookie(url: string, referer?: string) {
  const response = await fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      ...(referer ? { Referer: referer } : {}),
    },
  });
  const html = await response.text();
  const cookie = response.headers.get("set-cookie") || "";
  return { html, cookie };
}

async function fetchJson(url: string, referer?: string, cookie?: string) {
  const response = await fetch(url, {
    headers: {
      ...DEFAULT_HEADERS,
      ...(referer ? { Referer: referer } : {}),
      Origin: BASE_URL,
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function parseEpisodeList(html: string) {
  const $ = cheerio.load(html);
  const episodes: any[] = [];
  $("a.ep-item").each((_index, element) => {
    const epId = $(element).attr("data-id") || "";
    const number = $(element).attr("data-number") || $(element).find(".order").text().trim();
    const href = $(element).attr("href") || "";
    if (epId) {
      episodes.push({
        id: epId,
        number,
        url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
      });
    }
  });
  return episodes;
}

// Search endpoint
nineanimeRouter.get("/search", async (c: Context) => {
  try {
    const query = c.req.query("q");
    const page = c.req.query("page") || "1";

    if (!query) {
      return c.json({ success: false, error: "Query parameter is required" }, 400);
    }

    const searchUrl = `${BASE_URL}/filter?keyword=${encodeURIComponent(query)}&page=${page}`;
    const html = await fetchHtml(searchUrl);
    const $ = cheerio.load(html);

    const results: any[] = [];

    $("div.flw-item").each((_index, element) => {
      const $el = $(element);
      const id = $el.find("a.film-poster-ahref").attr("href")?.split("/").pop() || "";
      const title = $el.find("h3.film-name a").text().trim();
      const poster = $el.find("img.film-poster-img").attr("data-src") || $el.find("img.film-poster-img").attr("src") || "";
      const type =
        $el.find(".tick-item.tick-quality").text().trim() ||
        $el.find("div.film-poster span.fdi-item:first").text().trim();
      const episodes =
        $el.find(".tick-item.tick-eps").text().trim() ||
        $el.find("div.film-poster span.fdi-item:last").text().trim();

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

    const html = await fetchHtml(trendingUrl);
    const $ = cheerio.load(html);

    const results: any[] = [];

    $("div.flw-item").each((_index, element) => {
      const $el = $(element);
      const id = $el.find("a.film-poster-ahref").attr("href")?.split("/").pop() || "";
      const title = $el.find("h3.film-name a").text().trim();
      const poster = $el.find("img.film-poster-img").attr("data-src") || $el.find("img.film-poster-img").attr("src") || "";
      const type =
        $el.find(".tick-item.tick-quality").text().trim() ||
        $el.find("div.film-poster span.fdi-item:first").text().trim();

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

    const html = await fetchHtml(latestUrl);
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

    const html = await fetchHtml(infoUrl);
    const $ = cheerio.load(html);

      const title = $("h2.film-name").text().trim() || $("h1.film-name").text().trim();
      const poster =
        $("img.film-poster-img").attr("src") ||
        $("img.film-poster-img").attr("data-src") ||
        "";
      const description =
        $("div.film-description .shorting").text().trim() ||
        $("div.film-description").text().trim();

      const meta: Record<string, string> = {};
      $(".item").each((_index, element) => {
        const label = $(element).find(".item-title").text().trim().replace(/:$/, "");
        const value = $(element).find(".item-content").text().trim();
        if (label && value) {
          meta[label.toLowerCase()] = value;
        }
      });

      const type = meta.type || "";
      const status = meta.status || "";

      const internalId = $("#wrapper").attr("data-id") || "";

    let episodes: any[] = [];
    if (internalId) {
      try {
        const listUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
        const listRes = await fetchJson(listUrl, infoUrl);
        const html = listRes?.html || listRes?.raw || "";
        if (html) {
          episodes = parseEpisodeList(html);
        }
      } catch {
        episodes = [];
      }
    }

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
          internalId,
          episodeListUrl: internalId ? `${BASE_URL}/ajax/episode/list/${internalId}` : "",
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
    const episodeParam = c.req.query("ep");

    if (!id || !episodeParam) {
      return c.json(
        {
          success: false,
          error: "Both 'id' and 'ep' parameters are required",
        },
        400
      );
    }
    const watchUrl = `${BASE_URL}/watch/${id}`;
    const watchRes = await fetchHtmlWithCookie(watchUrl);
    const $watch = cheerio.load(watchRes.html);
    const internalId = $watch("#wrapper").attr("data-id") || "";

    let episodeId = episodeParam;
    if (internalId && /^[0-9]+$/.test(episodeParam)) {
      const listUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
      const listRes = await fetchJson(
        listUrl,
        `${watchUrl}?ep=${episodeParam}`,
        watchRes.cookie
      );
      const html = listRes?.html || listRes?.raw || "";
      if (html) {
        const episodes = parseEpisodeList(html);
        const match = episodes.find((ep) => String(ep.number) === String(episodeParam));
        if (match?.id) {
          episodeId = match.id;
        }
      }
    }

    const serversRes = await fetchJson(
      `${BASE_URL}/ajax/episode/servers?episodeId=${episodeId}`,
      `${watchUrl}?ep=${episodeId}`,
      watchRes.cookie
    );

    const serversHtml = serversRes?.html || serversRes?.raw || "";
    const $servers = cheerio.load(serversHtml);
    const firstServer = $servers(".server-item").first();
    const serverId = firstServer.attr("data-id") || "";

    if (!serverId) {
      return c.json(
        {
          success: false,
          error: "No video server found",
        },
        404
      );
    }

    const sourceRes = await fetchJson(
      `${BASE_URL}/ajax/episode/sources?id=${serverId}`,
      `${watchUrl}?ep=${episodeId}`,
      watchRes.cookie
    );

    if (!sourceRes?.link) {
      return c.json(
        {
          success: false,
          error: "No video source link found",
        },
        404
      );
    }

    const sources = [
      {
        url: sourceRes.link,
        quality: "default",
        isM3U8: sourceRes.link.includes(".m3u8"),
        type: sourceRes.type || "iframe",
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
