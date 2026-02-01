import * as cheerio from "cheerio";
import { AnimeCard } from "./types.js";

export function parseAnimeCards($: cheerio.CheerioAPI): AnimeCard[] {
  const cards: AnimeCard[] = [];

  $(".anime-card, .film-poster").each((_, elem) => {
    const $card = $(elem);

    // ID - from link
    const link = $card.find("a").attr("href") || "";
    const id = link.split("/watch/")[1]?.split("?")[0] || "";

    // Title
    const title = $card.find(".film-name, .anime-name").text().trim();

    // Poster
    const poster =
      $card.find("img").attr("data-src") ||
      $card.find("img").attr("src") ||
      "";

    // Type
    const type = $card.find(".fdi-item:first").text().trim();

    if (id && title) {
      cards.push({
        id,
        title,
        poster,
        type: type || undefined,
      });
    }
  });

  return cards;
}
