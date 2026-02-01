import { Context } from "hono";
import * as cheerio from "cheerio";
import { fetchHtml, fetchAjax, fetchAjaxJson, BASE_URL, SITE_URL } from "./helpers.js";

export async function getEpisodeLink(c: Context) {
  try {
    const { id, ep } = c.req.param();
    const episodeNumber = parseInt(ep);

    const watchUrl = `${SITE_URL}/watch/${id}`;
    const watchHtml = await fetchHtml(watchUrl);
    const $watch = cheerio.load(watchHtml);

    const internalId = $watch("div[data-id]").attr("data-id");

    if (!internalId) {
      return c.json(
        { success: false, error: "Could not find anime ID" },
        400
      );
    }

    const ajaxListUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
    const episodeListHtml = await fetchAjax(ajaxListUrl, watchUrl);
    const $episodes = cheerio.load(episodeListHtml);

    let episodeId: string | undefined;
    $episodes(".ep-item").each((_, elem) => {
      const $elem = $episodes(elem);
      const num = parseInt($elem.attr("data-number") || "0");
      if (num === episodeNumber) {
        episodeId = $elem.attr("data-id");
      }
    });

    if (!episodeId) {
      return c.json(
        { success: false, error: `Episode ${episodeNumber} not found` },
        404
      );
    }

    const serversUrl = `${BASE_URL}/ajax/episode/servers?episodeId=${episodeId}`;
    const serversHtml = await fetchAjax(serversUrl, watchUrl);
    const $servers = cheerio.load(serversHtml);

    const firstServer = $servers(".server-item").first();
    const serverId = firstServer.attr("data-id");

    if (!serverId) {
      return c.json(
        { success: false, error: "No video servers available" },
        503
      );
    }

    const sourcesUrl = `${BASE_URL}/ajax/episode/sources?id=${serverId}`;
    const sourceData = await fetchAjaxJson(sourcesUrl, watchUrl);

    return c.json({
      success: true,
      data: {
        animeId: id,
        episodeNumber,
        episodeId,
        serverId,
        link: sourceData.link,
        type: sourceData.type || "iframe",
        isM3U8: sourceData.link?.includes(".m3u8") || false,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to fetch episode link",
      },
      500
    );
  }
}

export async function getEpisodeSources(c: Context) {
  try {
    const animeId = c.req.query("id");
    const ep = c.req.query("ep");

    if (!animeId || !ep) {
      return c.json(
        { success: false, error: "Missing id or ep parameter" },
        400
      );
    }

    const episodeNumber = parseInt(ep);
    const watchUrl = `${SITE_URL}/watch/${animeId}`;
    const watchHtml = await fetchHtml(watchUrl);
    const $watch = cheerio.load(watchHtml);

    const internalId = $watch("div[data-id]").attr("data-id");

    if (!internalId) {
      return c.json(
        { success: false, error: "Could not find anime ID" },
        400
      );
    }

    const ajaxListUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
    const episodeListHtml = await fetchAjax(ajaxListUrl, watchUrl);
    const $episodes = cheerio.load(episodeListHtml);

    let episodeId: string | undefined;
    $episodes(".ep-item").each((_, elem) => {
      const $elem = $episodes(elem);
      const num = parseInt($elem.attr("data-number") || "0");
      if (num === episodeNumber) {
        episodeId = $elem.attr("data-id");
      }
    });

    if (!episodeId) {
      return c.json(
        { success: false, error: `Episode ${episodeNumber} not found` },
        404
      );
    }

    const serversUrl = `${BASE_URL}/ajax/episode/servers?episodeId=${episodeId}`;
    const serversHtml = await fetchAjax(serversUrl, watchUrl);
    const $servers = cheerio.load(serversHtml);

    const firstServer = $servers(".server-item").first();
    const serverId = firstServer.attr("data-id");

    if (!serverId) {
      return c.json(
        { success: false, error: "No video server found" },
        503
      );
    }

    const sourcesUrl = `${BASE_URL}/ajax/episode/sources?id=${serverId}`;
    const sourceData = await fetchAjaxJson(sourcesUrl, watchUrl);

    const sources = [
      {
        url: sourceData.link,
        quality: "default",
        isM3U8: sourceData.link?.includes(".m3u8") || false,
        type: sourceData.type || "iframe",
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
    return c.json(
      {
        success: false,
        error: error.message || "Failed to fetch episode sources",
      },
      500
    );
  }
}
