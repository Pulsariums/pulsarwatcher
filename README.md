# Tatakai API 🎌

> Unified Anime API combining HiAnime, regional scrapers, and utility APIs with modern caching, CORS, rate limiting, and logging.

## Features

- 🚀 **Modern Stack**: Built with [Hono](https://hono.dev/) - ultra-fast, lightweight web framework
- 💾 **Hybrid Caching**: Redis with LRU in-memory fallback
- 🔒 **Rate Limiting**: Configurable per-IP rate limiting
- 📝 **Structured Logging**: Pino logger with pretty dev output
- 🌐 **CORS Ready**: Configurable origin whitelisting
- 🐳 **Docker Ready**: Multi-stage Dockerfile included
- 📦 **TypeScript**: Full type safety
- 🧪 **Comprehensive Testing**: Built-in endpoint validation scripts

## API Endpoints

| Route | Description |
|-------|-------------|
| `/api/v1/hianime/*` | HiAnime scraper - search, info, episodes, sources |
| `/api/v1/anime/*` | External anime search providers (GogoAnime, Chia-Anime, etc.) |
| `/api/v1/anime-api/*` | Anime utility APIs (quotes, images, facts, waifu) |
| `/api/v1/animehindidubbed/*` | Hindi dubbed anime scraper |
| `/api/v1/animelok/*` | AnimeLok multi-language streaming |
| `/api/v1/animeya/*` | Animeya streaming platform |
| `/api/v1/watchaw/*` | WatchAnimeWorld multi-language streaming |
| `/health` | Health check |
| `/version` | API version info |

## Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- Redis (optional, for distributed caching)

### Installation

```bash
# Clone and install
cd TatakaiAPI
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build image only
docker build -t tatakai-api .
docker run -p 4000:4000 tatakai-api
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `REDIS_URL` | Redis connection URL | (empty = in-memory) |
| `CORS_ALLOWED_ORIGINS` | Allowed origins (comma-separated) | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CACHE_TTL_SECONDS` | Default cache TTL | `300` |

## API Nasıl Çalışır? (Kısa İç Mimari)

Bu API, farklı anime sağlayıcılarını tek bir çatı altında birleştirir. Her sağlayıcı `src/routes/` altında bağımsız bir router olarak bulunur ve `src/server.ts` içinde `BASE_PATH` (`/api/v1`) ile birleştirilir. Akış şu şekildedir:

1. **İstek giriş noktası**: `src/server.ts` Hono uygulamasını başlatır ve router’ları bağlar.
2. **Routing**: İstek URL’sine göre ilgili router devreye girer (ör. `/api/v1/hianime`, `/api/v1/nineanime`, `/api/v1/anime/*`).
3. **Scraping/Fetch**: Router ilgili sağlayıcının HTML/API yanıtını çeker ve `cheerio` gibi parser’larla normalize eder.
4. **Cache**: `src/config/cache.ts` üzerinden LRU/Redis önbelleği kullanılır. Aynı istekler daha hızlı döner.
5. **Rate Limit & CORS**: `src/config/ratelimit.ts` ve `src/config/cors.ts` istek sınırlarını ve erişim izinlerini yönetir.
6. **Hata Yönetimi**: Hatalar tek tip JSON formatında döndürülür.

Özetle: `server.ts` yönlendirir → router veri toplar → normalize eder → cache/limit uygulanır → JSON yanıt döner.

## Site Bazlı Durum Özeti (Neyi Neden Yaptık / Yapamadık)

Bu bölüm, geliştirme sırasında denenen sağlayıcıların neden çalıştığını veya neden çalışmadığını tek tek açıklar.

### ✅ Çalışanlar (Nasıl Yaptık?)

1. **NineAnime (9animetv.to)**
	- **Yöntem**: HTML sayfalarından `flw-item` kartlarını `cheerio` ile parse ediyoruz.
	- **Neden çalışıyor?** 9animetv.to arama sonuçları HTML içinde doğrudan geliyor (JS render zorunlu değil).
	- **Not**: Bölüm kaynakları sayfası JS ile yüklendiği için `/episode/sources` sınırlı olabilir.

2. **9AnimeTV (External Scrapers altında `/anime/9animetv/:query`)**
	- **Yöntem**: `/search?keyword=...` HTML çıktısı parse edilerek listeleniyor.
	- **Neden çalışıyor?** Arama sonuçları HTML içinde görünüyor, basit scraping yeterli.

3. **HiAnime (mevcut Tatakai sağlayıcısı)**
	- **Yöntem**: Orijinal Tatakai router’ı ile API/HTML parse.
	- **Neden çalışıyor?** Stable endpoint/selector yapısı ve halihazırda çalışan entegrasyon.

### ⚠️ Yapamadıklarımız (Neden?)

1. **9anime.to**
	- **Sorun**: Arama sayfası gerçek sonuç yerine statik “landing” HTML döndürüyor.
	- **Sonuç**: HTML’de liste yok, scraping yapılamadı.

2. **Aniwave (aniwave.to)**
	- **Sorun**: Zaman aşımı ve/veya farklı domain’e yönlendirme (erişim stabil değil).
	- **Sonuç**: Sürekli veri alınamadığı için entegrasyon güvenilir değil.

3. **AnimePahe (animepahe.ru)**
	- **Sorun**: DNS/erişim problemi (host çözülemiyor).
	- **Sonuç**: Sunucuya erişim yok, entegrasyon mümkün değil.

4. **AnimeHeaven**
	- **Sorun**: Arama sonucu HTML içinde doğrudan listelenmiyor, JS üzerinden `fastsearch.php` ile geliyor.
	- **Sonuç**: Basit HTML scraping yetersiz; ek endpoint çözümü gerekiyor.

> İleride yapılacaklar: JS ile render edilen siteler için **headless** veya **doğrudan AJAX endpoint** çözümü eklenebilir.

## Testing

Run the comprehensive test suite to validate all API endpoints:

```bash
# Run basic validation
npm run test

# Run comprehensive endpoint tests
npm run test:comprehensive
```

The comprehensive test script checks all routes with sample parameters and reports success/failure status for each endpoint.

## Example Requests

```bash
# HiAnime home page
curl http://localhost:4000/api/v1/hianime/home

# Search anime on HiAnime
curl "http://localhost:4000/api/v1/hianime/search?q=naruto"

# External anime search (GogoAnime)
curl "http://localhost:4000/api/v1/anime/gogoanime/naruto"

# Anime quotes
curl "http://localhost:4000/api/v1/anime-api/quotes/random"

# Anime images
curl "http://localhost:4000/api/v1/anime-api/images/waifu"

# Hindi dubbed search
curl "http://localhost:4000/api/v1/hindidubbed/search?title=naruto"

# Animeya home
curl "http://localhost:4000/api/v1/animeya/home"
```

## Project Structure

```
TatakaiAPI/
├── src/
│   ├── config/       # Configuration (env, cache, cors, logger, etc.)
│   ├── middleware/   # Hono middleware (logging, cache control)
│   ├── routes/       # API routes by provider
│   │   ├── hianime/
│   │   ├── anime/
│   │   ├── anime-api/
│   │   ├── animehindidubbed/
│   │   ├── animelok/
│   │   ├── animeya/
│   │   └── watchanimeworld/
│   ├── server.ts     # Main entry point
│   └── utils.ts      # Utility functions
├── scripts/          # Utility scripts
│   ├── comprehensive_test.ts  # Full API endpoint testing
│   └── validate_api.ts        # API validation script
├── public/           # Static files
├── Dockerfile
└── docker-compose.yml
```

## License

MIT
