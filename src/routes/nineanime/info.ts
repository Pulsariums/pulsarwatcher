import { Context } from "hono";
import * as cheerio from "cheerio";
import { fetchHtml, fetchAjax, BASE_URL, SITE_URL } from "./helpers";
import { Episode } from "./types";

export async function getAnimeInfo(c: Context) {
  try {
    const id = c.req.param("id");

    const html = await fetchHtml(`${SITE_URL}/watch/${id}`);
    const $ = cheerio.load(html);

    const title = $("h1.film-title").text().trim();
    const description = $("div.film-description p").text().trim();
    const poster = $("img.film-poster").attr("src") || "";

    const episodesText = $("div.film-stats span:contains('Episodes')").text();
    const episodesMatch = episodesText.match(/(\d+)/);
    const episodes = episodesMatch ? parseInt(episodesMatch[1]) : 0;

    const ratingText = $("span.film-rating").text();
    const rating = parseFloat(ratingText) || 0;

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

    const internalId = $watch("div[data-id]").attr("data-id");

    if (!internalId) {
      return c.json(
        { success: false, error: "Could not find anime ID" },
        400
      );
    }

    const ajaxUrl = `${BASE_URL}/ajax/episode/list/${internalId}`;
    const episodeHtml = await fetchAjax(ajaxUrl, watchUrl);
    const $episodes = cheerio.load(episodeHtml);

    const episodes: Episode[] = [];
    $episodes(".ep-item").each((_, elem) => {
      const $elem = $episodes(elem);
      const episodeNum = $elem.attr("data-number");
      const episodeId = $elem.attr("data-id");
      const title =
        $elem.find(".name")?.text()?.trim() || `Episode ${episodeNum}`;

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
