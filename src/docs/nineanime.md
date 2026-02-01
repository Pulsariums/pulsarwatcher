# 🚀 NineAnime & AnimeUnity - API Implementation Guide

> **Amaç**: Tatakai API'ye NineAnime ve AnimeUnity scraper'ını eklemek
> **Zorluk**: Orta
> **Teknik**: Cheerio (HTML parsing) + Puppeteer (JS rendering)

---

## 📋 NineAnime & AnimeUnity Durumu

### Neden Henüz Yok?

1. **NineAnime**: 
   - Basit HTML parsing ile yapılabilir (Cheerio yeterli)
   - ✅ Hızlı, hafif
   - ⚠️ HTML yapısı değişebilir (maintenance gerekli)

2. **AnimeUnity**:
   - JavaScript ile dinamik loading yapıyor
   - ❌ Puppeteer gerekli (ağır, yavaş)
   - ⚠️ Production'da şekil problem

---

## 🛠️ Tatakai API Mimarisi (Nasıl Çalışıyor?)

### Dosya Yapısı

```
src/
├── routes/
│   ├── hianime/
│   │   └── index.ts           ← Hono router
│   ├── animeya/
│   │   └── index.ts
│   ├── animelok/
│   │   └── index.ts
│   └── [NEW] nineanime/
│       └── index.ts           ← BİZ BURAYA EKLEYECEĞIZ
│
├── config/
│   ├── cache.js               ← Redis caching
│   └── context.js             ← Type definitions
│
├── server.ts                   ← Main app
└── utils.ts
```

### server.ts Yapısı

```typescript
// 1. Import route'ları
import { hianimeRouter } from "./routes/hianime/index.js";
import { animeyaRouter } from "./routes/animeya/index.js";
import { animeRouter } from "./routes/anime/index.js";
// BİZ BUNU EKLEYECEĞIZ:
// import { nineanimeRouter } from "./routes/nineanime/index.js";

// 2. Register route'ları
const BASE_PATH = "/api/v1";
app.route(`${BASE_PATH}/hianime`, hianimeRouter);
app.route(`${BASE_PATH}/animeya`, animeyaRouter);
app.route(`${BASE_PATH}/anime`, animeRouter);
// BİZ BUNU EKLEYECEĞIZ:
// app.route(`${BASE_PATH}/nineanime`, nineanimeRouter);
```

---

## 🎯 Step-by-Step Implementation

### STEP 1: Klasör ve Dosya Oluştur

```bash
cd /workspaces/Tatakai

# NineAnime için
mkdir -p src/routes/nineanime

# AnimeUnity için (isteğe bağlı)
mkdir -p src/routes/animeunity
```

### STEP 2: NineAnime Router Oluştur

File: `src/routes/nineanime/index.ts`

```typescript
import { Hono } from "hono";
import * as cheerio from "cheerio";
import { cache } from "../../config/cache.js";
import type { ServerContext } from "../../config/context.js";

const nineanimeRouter = new Hono<ServerContext>();

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

  // NineAnime HTML struktur örneği:
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
    const title = $el.find("h3.film-name a").attr("title") || 
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

    // Cache key
    const cacheKey = `nineanime:search:${query}:${page}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return c.json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      });
    }

    // Fetch HTML
    const url = `https://nineanime.com/search?keyword=${encodeURIComponent(
      query
    )}&page=${page}`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // Parse anime'leri
    const animes = parseAnimeCards($);

    // Cache'ye kaydet (1 saat)
    await cache.set(cacheKey, JSON.stringify(animes), 3600);

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
    const cacheKey = `nineanime:trending:${page}`;

    // Cache'den kontrol et
    const cached = await cache.get(cacheKey);
    if (cached) {
      return c.json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      });
    }

    // Fetch trending page
    const html = await fetchHtml(
      `https://nineanime.com/trending?page=${page}`
    );
    const $ = cheerio.load(html);

    const animes = parseAnimeCards($);

    // Cache'ye kaydet
    await cache.set(cacheKey, JSON.stringify(animes), 1800);

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
// Anime Info Endpoint (Gelişmiş)
// ============================================

nineanimeRouter.get("/info/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cacheKey = `nineanime:info:${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return c.json({
        success: true,
        data: JSON.parse(cached),
      });
    }

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
    const episodesText = $(
      "div.film-stats span:contains('Episodes')"
    ).text();
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

    // Cache 6 saat
    await cache.set(cacheKey, JSON.stringify(data), 21600);

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
// Episode Sources Endpoint (Hardest)
// ============================================

nineanimeRouter.get("/episode/sources", async (c) => {
  try {
    const animeId = c.req.query("id");
    const episodeNumber = c.req.query("ep");

    if (!animeId || !episodeNumber) {
      return c.json(
        { error: "Missing id or ep parameter" },
        400
      );
    }

    // NineAnime'de episode URL'si: 
    // https://nineanime.com/watch/{animeId}?ep={episodeNumber}

    const episodeUrl = `https://nineanime.com/watch/${animeId}?ep=${episodeNumber}`;
    const html = await fetchHtml(episodeUrl);
    const $ = cheerio.load(html);

    // Video player'ı bul
    // NineAnime typically: <iframe src="video-embed-url" ...>
    const iframeSrc =
      $("iframe.video-container").attr("src") || 
      $("iframe[src*='nineanime']").attr("src") ||
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

    // M3U8 URL'sini iframe'den çıkar
    // Not: Bu site'ye göre değişebilir
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
```

### STEP 3: server.ts'ye Route'ı Register Et

File: `src/server.ts`

Aşağıdaki satırları ekle:

```typescript
// Line 20 civarında (diğer imports ile beraber)
import { nineanimeRouter } from "./routes/nineanime/index.js";

// Line 620 civarında (diğer route'lar ile beraber)
app.route(`${BASE_PATH}/nineanime`, nineanimeRouter);

// Docs'a da ekle (line 65 civarında):
const files = [
  "intro.md",
  "hianime.md",
  "animeya.md",
  "nineanime.md",  // BURAYA EKLE
  "sdk.md",
  "regional.md",
  "utility.md",
  "external.md",
];
```

### STEP 4: Documentation Oluştur

File: `src/docs/nineanime.md`

```markdown
# NineAnime Scraper

Lightweight HTML-based scraper for nineanime.com

## Base URL

`/api/v1/nineanime`

## Endpoints

### 1. Search

- **URL**: `/search?q=query&page=1`
- **Method**: `GET`
- **Query Params**:
  - `q` (required): Anime adı
  - `page` (optional): Sayfa numarası (default: 1)

#### Example

```bash
curl "https://tatakaiapi.vercel.app/api/v1/nineanime/search?q=frieren"
```

### 2. Trending

- **URL**: `/trending?page=1`
- **Method**: `GET`

### 3. Anime Info

- **URL**: `/info/:id`
- **Method**: `GET`
- **Params**: `id` (anime slug)

### 4. Episode Sources

- **URL**: `/episode/sources?id=anime-id&ep=1`
- **Method**: `GET`

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "frieren-beyond-journeys-end",
      "title": "Frieren: Beyond Journey's End",
      "poster": "https://...",
      "type": "TV"
    }
  ]
}
```

## Status

✅ Working on nineanime.com
```

---

## 🎬 AnimeUnity (Optional - Advanced)

AnimeUnity JavaScript ile dinamik loading yapıyor. Puppeteer gerekli:

```bash
npm install puppeteer
```

File: `src/routes/animeunity/index.ts`

```typescript
import { Hono } from "hono";
import puppeteer from "puppeteer";
import { cache } from "../../config/cache.js";
import type { ServerContext } from "../../config/context.js";

const animeunityRouter = new Hono<ServerContext>();

animeunityRouter.get("/search", async (c) => {
  try {
    const query = c.req.query("q");

    if (!query) {
      return c.json({ error: "Missing query" }, 400);
    }

    // Puppeteer ile render et
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(`https://animeunity.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: "networkidle2",
    });

    // Anime'leri extract et
    const animes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div.anime-card")).map(
        (el: any) => ({
          id: el.querySelector("a")?.href?.split("/").pop(),
          title: el.querySelector("h3")?.textContent,
          poster: el.querySelector("img")?.src,
          type: el.querySelector(".type")?.textContent || "TV",
        })
      );
    });

    await browser.close();

    return c.json({
      success: true,
      data: animes,
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

export default animeunityRouter;
```

---

## 🧪 Test

```bash
# Development'ı başlat
npm run dev

# NineAnime'yi test et
curl "http://localhost:4000/api/v1/nineanime/search?q=frieren"
curl "http://localhost:4000/api/v1/nineanime/trending"
curl "http://localhost:4000/api/v1/nineanime/info/frieren-beyond-journeys-end"
```

---

## 📋 Checklist

- [ ] `src/routes/nineanime/` klasörü oluştur
- [ ] `src/routes/nineanime/index.ts` oluştur (kod yukarıda)
- [ ] `src/server.ts`'ye import ekle
- [ ] `src/server.ts`'ye route register'ı ekle
- [ ] `src/docs/nineanime.md` oluştur
- [ ] `npm run dev` ile test et
- [ ] Deploy et: `npm run build && npm start`

---

## ⚠️ Dikkat Noktaları

1. **HTML yapısı değişebilir**
   - Site güncellerse selector'lar kırılabilir
   - Regular testing gerekli

2. **Rate limiting**
   - NineAnime DDOS koruması vardır
   - Requests arasında delay ekle

3. **Puppeteer (AnimeUnity)**
   - Ağır ve yavaş
   - Production'da sınırla
   - Cache aggressively

4. **Error handling**
   - Site down olabilir
   - Fallback provider'a git

---

**Status**: 🟢 Ready to implement
**Teknik**: Cheerio (NineAnime) + Puppeteer (AnimeUnity)
**Maintenance**: Medium
