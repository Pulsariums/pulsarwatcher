# PulsarWatch API 🎌

> Unified Anime API combining HiAnime, NineAnime, AnimeUnity and regional scrapers with modern caching, CORS, rate limiting, and modular architecture.

## ✨ Key Features

- 🚀 **Modern Stack**: Built with [Hono](https://hono.dev/) - ultra-fast, lightweight web framework
- 🎯 **Modular Architecture**: Each scraper is independently manageable with registry system
- 💾 **Hybrid Caching**: Redis with LRU in-memory fallback
- 🔒 **Rate Limiting**: Configurable per-IP rate limiting
- 📝 **Structured Logging**: Pino logger with pretty dev output
- 🌐 **CORS Ready**: Configurable origin whitelisting
- 🐳 **Docker Ready**: Multi-stage Dockerfile included
- 📦 **TypeScript**: Full type safety
- 🧪 **Comprehensive Testing**: Built-in endpoint validation scripts
- 🎛️ **Centralized Management**: Scraper registry and health monitoring

### Management & System

| Route | Description |
|-------|-------------|
| `/api/v1/manage/scrapers` | List all registered scrapers with metadata |
| `/api/v1/manage/scrapers/active` | Get only active scrapers |
| `/api/v1/manage/scrapers/:id` | Get specific scraper details |
| `/api/v1/manage/health` | System health check for all scrapers |
| `/api/v1/manage/stats` | System statistics and scraper status |

### Scraper Endpoints

| Route | Description | Status |
|-------|-------------|--------|
| `/api/v1/hianime/*` | HiAnime scraper - search, info, episodes, sources | ✅ Active |
| `/api/v1/nineanime/*` | NineAnime scraper - search, info, sources | ✅ Active |
| `/api/v1/animeunity/*` | AnimeUnity scraper - Italian platform | ✅ Active |
| `/api/v1/animeya/*` | Animeya streaming platform | ✅ Active |
| `/api/v1/hindidubbed/*` | Hindi dubbed anime scraper | ✅ Active |
| `/api/v1/watchaw/*` | WatchAnimeWorld streaming | ✅ Active |
| `/api/v1/anime/*` | External providers (GogoAnime, etc.) | ✅ Active |
| `/api/v1/anime-api/*` | Utility APIs (quotes, images, waifu) | ✅ Active |

### Utility Endpoints

| Route | Description |
|-------|-------------|
| `/health` | Basic health check |
| `/version` | API version info |
| `/docs` | Interactive documentation |
| `/info` | Detailed usage guide with examplesimeWorld multi-language streaming |
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
cd pulsarwatcher
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### Docker

```bash
# B🏗️ Architecture

### Modular Scraper System

Each scraper is organized as an independent module:

```
src/routes/{scraper}/
├── index.ts       # Main router logic
├── config.ts      # Configuration constants
├── fetcher.ts     # HTTP request handlers
├── parser.ts      # HTML/JSON parsing logic
├── types.ts       # TypeScript types
├── utils.ts       # Helper functions
└── registry.ts    # Auto-registration with ScraperRegistry
```

### Core System

```
src/core/
├── ScraperRegistry.ts  # Centralized scraper management
├── types.ts            # Shared TypeScript interfaces
└── utils.ts            # Common utility functions
```

All scrapers auto-register on import, providing:
- Metadata (name, version, status, features)
- Endpoint mapping
- Health monitoring
- Centralized management API

## 🎛️ Scraper Management

Check all registered scrapers:
```bash
curl http://localhost:4000/api/v1/manage/scrapers
```

System health check:
```bash
curl http://localhost:4000/api/v1/manage/health
```

Get specific scraper info:
```bash
curl http://localhost:4000/api/v1/manage/scrapers/hianime
```
docker-compose up -d

# Or build image only
docker build -t pulsarwatch-api .
docker run -p 4000:4000 pulsarwatch-api
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

### ✅ Çalışanlar / Entegre Sağlayıcılar (Tek Tek)

**Ana sağlayıcılar**
1. **HiAnime** (`/api/v1/hianime/*`)
	- **Durum**: ✅ Çalışıyor
	- **Nasıl**: Mevcut Tatakai router + aniwatch paketi

2. **NineAnime** (`/api/v1/nineanime/*`)
	- **Durum**: ✅ Çalışıyor
	- **Nasıl**: Özel scraper ve parser modülleri

3. **Animeya** (`/api/v1/animeya/*`)
	- **Durum**: ✅ Çalışıyor
	- **Nasıl**: Animeya streaming platform entegrasyonu

4. **HindiDubbed** (`/api/v1/hindidubbed/*`)
	- **Durum**: ✅ Çalışıyor
	- **Nasıl**: animehindidubbed.in scraper

5. **WatchAnimeWorld** (`/api/v1/watchaw/*`)
	- **Durum**: ✅ Çalışıyor
	- **Nasıl**: WatchAnimeWorld scraper

**Bölgesel / Diğer (Durumu Değişken)**
1. **Animelok** (`/api/v1/animelok/*`)
	- **Durum**: ❌ Bakımda / Domain Değişikliği (Geçici olarak ulaşılamıyor)

2. **Desidubanime** (`/api/v1/desidubanime/*`)
	- **Durum**: ❌ Bakımda / Kapalı (Geçici olarak ulaşılamıyor)
	- **Nasıl**: HTML sonuçları `flw-item` kartlarından `cheerio` ile parse
	- **Not**: `/episode/sources` kısmi (JS ile yüklenen player)

**Regional sağlayıcılar**
3. **HindiDubbed** (`/api/v1/hindidubbed/*`, domain: animehindidubbed.in)
4. **AnimeLok** (`/api/v1/animelok/*`, domain: animelok.to)
5. **WatchAW** (`/api/v1/watchaw/*`)
6. **DesiDubAnime** (`/api/v1/desidubanime/*`, domain: desidubanime.me)
7. **Animeya** (`/api/v1/animeya/*`)

**External Scrapers (Klasik sağlayıcılar)**
8. **9AnimeTV (external)** (`/api/v1/anime/9animetv/:query`, domain: 9animetv.to)
	- **Durum**: Çalışıyor (test edildi)
9. **GogoAnime** (`/api/v1/anime/gogoanime/:query`, domain: gogoanime3.co)
10. **Chia-Anime** (`/api/v1/anime/chia-anime/:query`, domain: chia-anime.su)
11. **Anime-Freak** (`/api/v1/anime/anime-freak/:query`, domain: animefreak.video)
12. **Animeland** (`/api/v1/anime/animeland/:query`, domain: animeland.tv)

**Meta / Utility**
13. **Anime-API Utilities** (`/api/v1/anime-api/*`)
	- Örnek: quotes, images, facts (ör. waifu.im)

> Not: External/Regional sağlayıcılar, upstream site değişikliklerine bağlı olarak dalgalanabilir.

### ⚠️ Denendi ama Olmadı / Eksik Kalanlar (Neden?)

1. **9anime.to**
	- **Sorun**: Arama sayfası gerçek sonuç yerine statik “landing” HTML döndürüyor.
	- **Sonuç**: HTML’de liste yok, scraping yapılamadı.

2. **Aniwave (aniwave.to)**
	- **Sorun**: Zaman aşımı + farklı domain’e yönlendirme (erişim stabil değil).
	- **Sonuç**: Sürekli veri alınamadığı için entegrasyon güvenilir değil.

3. **AnimePahe (animepahe.ru/.com/.org)**
	- **Sorun**: DNS çözümlenemiyor veya 301 yönlendirme/koruma.
	- **Sonuç**: Stabil erişim yok, scraping mümkün değil.

4. **AnimeUnity (animeunity.to/.tv/.org)**
	- **Sorun**: 403/405 + agresif koruma/JS gerekli.
	- **Sonuç**: Basit HTML fetch ile sonuç alınamadı.

5. **Anikai (animwkai olarak istenen)**
	- **Durum**: `anikai.to` erişilebilir ama bu repoda **router bağlı değil**.
	- **Sonuç**: API endpoint yok, önce router eklenmesi gerekiyor.

6. **AnimeHeaven**
	- **Sorun**: Arama sonuçları HTML’de yok, JS ile `fastsearch.php` üzerinden geliyor.
	- **Sonuç**: Basit scraping yetersiz; AJAX endpoint çözümü gerekiyor.

> İleride yapılacaklar: JS render eden siteler için **headless** veya **doğrudan AJAX endpoint** entegrasyonu eklenebilir.

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
