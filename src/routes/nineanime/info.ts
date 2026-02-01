import { Context } from "hono";
import * as cheerio from "cheerio";
import { fetchHtml, fetchAjaxJson, BASE_URL, SITE_URL } from "./helpers.js";
import { Episode } from "./types.js";

export async function getAnimeInfo(c: Context) {
  try {
    const id = c.req.param("id");

    const html = await fetchHtml(`${SITE_URL}/watch/${id}`);
    const $ = cheerio.load(html);

    // Corrected selectors for 9animetv.to
    const title = $("h2.film-name.dynamic-name").text().trim();
    const description = $("div.film-description").text().trim();
    const poster = $("img.film-poster-img").attr("data-src") || $("img.film-poster-img").attr("src") || "";
    
    // Get episodes count from internal ID + AJAX
    const internalId = $("#wrapper[data-id]").attr("data-id");
    let episodes = 0;
    
    if (internalId) {
      try {
        const ajaxUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
        const ajaxData = await fetchAjaxJson(ajaxUrl, `${SITE_URL}/watch/${id}`);
        if (ajaxData.status && ajaxData.html) {
          const $ajax = cheerio.load(ajaxData.html);
          episodes = $ajax(".ep-item").length;
        }
      } catch (e) {
        // Silently fail, episodes will be 0
      }
    }

    const rating = parseFloat($("span.score").text()) || 0;

    const data = {
      id,
      title,
      description,
      poster,
      episodes,
      rating,
    };

    return c.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to fetch anime info",
      },
      500
    );
  }
}

export async function getEpisodesList(c: Context) {
  try {
    const id = c.req.param("id");

    const watchUrl = `${SITE_URL}/watch/${id}`;
    const watchHtml = await fetchHtml(watchUrl);
    const $watch = cheerio.load(watchHtml);

    // Corrected selector: #wrapper has data-id attribute
    const internalId = $watch("#wrapper[data-id]").attr("data-id");
    if (!internalId) {
      return c.json(
        { success: false, error: "Could not find anime ID" },
        400
      );
    }

    const ajaxUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
    const ajaxData = await fetchAjaxJson(ajaxUrl, watchUrl);
    
    if (!ajaxData.status || !ajaxData.html) {
      return c.json(
        { success: false, error: "Failed to fetch episode list" },
        500
      );
    }

    const $episodes = cheerio.load(ajaxData.html);

    const episodes: Episode[] = [];
    $episodes(".ep-item").each((_, elem) => {
      const $elem = $episodes(elem);
      const episodeNum = $elem.attr("data-number");
      const episodeId = $elem.attr("data-id");
      const title = $elem.attr("title") || `Episode ${episodeNum}`;

      if (episodeNum && episodeId) {
        episodes.push({
          number: parseInt(episodeNum),
          id: episodeId,
          title: title,
        });
      }
    });

    return c.json({
      success: true,
      data: {
        animeId: id,
        internalId,
        episodes,
        totalEpisodes: episodes.length,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to fetch episodes",
      },
      500
    );
  }
}
