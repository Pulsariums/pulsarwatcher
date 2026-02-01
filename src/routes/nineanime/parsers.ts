import * as cheerio from "cheerio";
import { AnimeCard } from "./types.js";

export function parseAnimeCards($: cheerio.CheerioAPI): AnimeCard[] {
  const cards: AnimeCard[] = [];

  $(".flw-item").each((_, elem) => {
    const $card = $(elem);

    // Link from poster or title
    const link = 
      $card.find(".film-poster a").attr("href") ||
      $card.find(".film-name a").attr("href") ||
      "";
    
    const id = link.split("/watch/")[1]?.split("?")[0] || "";

    // Title
    const title =
      $card.find(".film-name a").attr("title") ||
      $card.find(".film-name a").text().trim() ||
      $card.find("h3.film-name a").text().trim();

    // Poster
    const poster =
      $card.find("img").attr("data-src") ||
      $card.find("img").attr("src") ||
      "";

    // Type
    const type = $card.find(".fdi-item").first().text().trim();

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
