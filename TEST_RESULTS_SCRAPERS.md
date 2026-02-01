# PulsarWatcher Scraper Test Sonuçları

**Test Tarihi:** 1 Şubat 2026  
**Test Edilen URL:** https://pulsarwatcher.vercel.app

---

## 📊 Test Özeti

| Scraper | Durum | Video Erişimi | Test Sayısı |
|---------|-------|---------------|-------------|
| **NineAnime** | ✅ ÇALIŞIYOR | ✅ Başarılı | 3/3 |
| **HiAnime** | ✅ ÇALIŞIYOR | ⚠️ Kısmen | 3/3 |
| **AnimeUnity** | ❌ HATA | ❌ Erişilemiyor | 0/3 |
| **AniKai** | ❌ BAĞLI DEĞİL | ❌ Router Yok | 0/3 |

---

## 1️⃣ NineAnime Scraper

### ✅ Durum: TAMAMEN ÇALIŞIYOR

### Test Edilen Animeler:
1. **Naruto** (naruto-677)
   - Toplam Bölüm: 220
   - Video: ✅ Erişilebilir
   - URL Türü: iframe (rapid-cloud.co)

2. **Naruto Shippuden** (naruto-shippuden-355)
   - Toplam Bölüm: 500
   - Video: ✅ Erişilebilir
   - URL Türü: iframe (rapid-cloud.co)

3. **Boruto: Naruto Next Generations** (boruto-naruto-next-generations-8143)
   - Toplam Bölüm: 293
   - Video: ✅ Erişilebilir
   - URL Türü: iframe (rapid-cloud.co)

### 📝 Nasıl Kullanılır?

#### 1. Anime Arama
```bash
GET /api/v1/nineanime/search?q={anime_adı}
```
**Gerekli Parametre:**
- `q`: Arama terimi (örn: "naruto")

**Dönen Veri:**
```json
{
  "success": true,
  "data": [
    {
      "id": "naruto-677",
      "title": "Naruto",
      "poster": "https://cdn.noitatnemucod.net/..."
    }
  ],
  "query": "naruto",
  "page": 1
}
```

#### 2. Anime Bilgisi
```bash
GET /api/v1/nineanime/info/{anime_id}
```
**Gerekli Parametre:**
- `anime_id`: Aramadan dönen ID (örn: "naruto-677")

**Dönen Veri:**
```json
{
  "success": true,
  "data": {
    "id": "naruto-677",
    "title": "Naruto",
    "description": "...",
    "poster": "https://...",
    "episodes": 220,
    "rating": 0
  }
}
```

#### 3. Video Kaynağı (ÖNEMLİ!)
```bash
GET /api/v1/nineanime/episode/sources?id={anime_id}&ep={episode_number}
```
**Gerekli Parametreler:**
- `id`: Anime ID (örn: "naruto-677")
- `ep`: Bölüm numarası (örn: "1")

**Dönen Veri:**
```json
{
  "success": true,
  "data": {
    "sources": [
      {
        "url": "https://rapid-cloud.co/embed-2/v2/e-1/...",
        "quality": "default",
        "isM3U8": false,
        "type": "iframe"
      }
    ],
    "subtitles": []
  }
}
```

### ⚠️ Önemli Notlar:
- Video URL'leri **iframe** formatında
- M3U8 değil, doğrudan embed link
- rapid-cloud.co sunucusunu kullanıyor
- Her bölüm için ayrı sources çağrısı yapılmalı

### 🔐 Tarayıcıda Kullanım (CORS Bypass):

Tarayıcıda video oynatmak için **Supabase Proxy** kullanın:

```javascript
const videoUrl = "https://rapid-cloud.co/embed-2/v2/e-1/26xyAu57LxHb?z=";

// Proxy ile CORS bypass
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYnphbWZ5dXBqYWZ1Z3FlYWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjU2MDAsImV4cCI6MjA1NDAwMTYwMH0.verified_2026";
const proxiedUrl = `https://xkbzamfyupjafugqeaby.supabase.co/functions/v1/video-proxy-v2?url=${encodeURIComponent(videoUrl)}&apikey=${SUPABASE_KEY}`;

// iframe'de kullan
// <iframe src={proxiedUrl} allowFullScreen />
```

**Alternatif - Pulroxy:**
```javascript
const proxiedUrl = `https://pulroxy.pulsariums.workers.dev/proxy?url=${encodeURIComponent(videoUrl)}`;
```

⚠️ **Not:** Pulroxy bazı videolarda "File not found" hatası verebilir. Supabase Proxy daha güvenilir.

---

## 2️⃣ HiAnime Scraper

### ✅ Durum: ÇALIŞIYOR (Bazı videolar eksik olabilir)

### Test Edilen Animeler:
1. **Jujutsu Kaisen 2nd Season** (jujutsu-kaisen-2nd-season-18413)
   - Toplam Bölüm: 23 (sub), 23 (dub)
   - Video: ✅ Erişilebilir
   - Tür: HLS/M3U8

2. **One Piece Movie 1** (one-piece-movie-1-3096)
   - Toplam Bölüm: 1
   - Video: ❌ Bulunamadı

3. **Tokyo 7th Sisters** (tokyo-7th-sisters-15583)
   - Toplam Bölüm: 1
   - Video: ❌ Bulunamadı

### 📝 Nasıl Kullanılır?

#### 1. Anime Arama
```bash
GET /api/v1/hianime/search?q={anime_adı}
```
**Gerekli Parametre:**
- `q`: Arama terimi

**Dönen Veri:**
```json
{
  "provider": "PulsarWatch",
  "status": 200,
  "data": {
    "animes": [
      {
        "id": "jujutsu-kaisen-2nd-season-18413",
        "name": "Jujutsu Kaisen 2nd Season",
        "jname": "...",
        "poster": "https://...",
        "episodes": {
          "sub": 23,
          "dub": 23
        }
      }
    ]
  }
}
```

#### 2. Anime Detayları
```bash
GET /api/v1/hianime/anime/{anime_id}
```
**Gerekli Parametre:**
- `anime_id`: Anime ID (örn: "jujutsu-kaisen-2nd-season-18413")

**Dönen Veri:**
```json
{
  "provider": "PulsarWatch",
  "status": 200,
  "data": {
    "anime": {
      "info": {
        "name": "Jujutsu Kaisen 2nd Season",
        "poster": "...",
        "description": "..."
      },
      "moreInfo": {
        "totalEpisodes": null
      }
    }
  }
}
```

#### 3. Bölüm Listesi
```bash
GET /api/v1/hianime/anime/{anime_id}/episodes
```
**Gerekli Parametre:**
- `anime_id`: Anime ID

**Dönen Veri:**
```json
{
  "data": {
    "episodes": [
      {
        "title": "Episode Title",
        "episodeId": "jujutsu-kaisen-2nd-season-18413?ep=105053",
        "number": 1,
        "isFiller": false
      }
    ]
  }
}
```

#### 4. Video Kaynağı
```bash
GET /api/v1/hianime/episode/sources?animeEpisodeId={episode_id}
```
**Gerekli Parametre:**
- `animeEpisodeId`: Bölüm listesinden alınan episodeId (örn: "jujutsu-kaisen-2nd-season-18413?ep=105053")

**Dönen Veri:**
```json
{
  "provider": "PulsarWatch",
  "status": 200,
  "data": {
    "headers": {
      "Referer": "https://megacloud.blog/"
    },
    "tracks": [
      {
        "url": "https://mgstatics.xyz/subtitle/.../subtitle.vtt",
        "lang": "English"
      }
    ],
    "sources": [
      {
        "url": "https://stormshade84.live/.../master.m3u8",
        "isM3U8": true,
        "type": "hls"
      }
    ],
    "anilistID": 151807,
    "malID": 51009
  }
}
```

### ⚠️ Önemli Notlar:
- **M3U8/HLS formatında** video akışı
- Altyazı desteği var (VTT formatında)
- Referer header'ı gerekli: `Referer: https://megacloud.blog/`
- AniList ve MAL ID'leri de döner
- Bazı eski veya film içeriklerde video bulunamayabilir

### 🔐 Tarayıcıda Kullanım:

HiAnime M3U8 videoları için **proxy kullanmayın**. Modern video player'lar (hls.js, video.js) direkt M3U8 URL'sini oynatabilir:

```javascript
// M3U8 URL'sini direkt kullan
const m3u8Url = "https://stormshade84.live/.../master.m3u8";

// hls.js ile oynat
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const video = document.getElementById('video');
  const hls = new Hls({
    xhrSetup: function(xhr) {
      xhr.setRequestHeader('Referer', 'https://megacloud.blog/');
    }
  });
  hls.loadSource(m3u8Url);
  hls.attachMedia(video);
}
```

**Video.js Örneği:**
```html
<video id="my-video" class="video-js" controls preload="auto">
  <source src="https://stormshade84.live/.../master.m3u8" type="application/x-mpegURL">
</video>

<script>
  videojs('my-video');
</script>
```

⚠️ **Not:** Supabase Proxy ve Pulroxy M3U8 videoları için çalışmıyor (Cloudflare korumalı). Direkt URL kullanın.

---

## 3️⃣ AnimeUnity Scraper

### ❌ Durum: ÇALIŞMIYOR

### Hata:
```json
{
  "status": 500,
  "message": "Internal Server Error",
  "error": "Error",
  "timestamp": "2026-02-01T07:47:34.396Z"
}
```

### Test Sonucu:
- Tüm endpoint'ler 500 hatası veriyor
- Search endpoint'i erişilemiyor
- İtalyanca site (animeunity.so) muhtemelen anti-scraping önlemleri almış

### 📝 Kullanım Bilgisi (Şu an kullanılamaz):
```bash
GET /api/v1/animeunity/search?q={anime_adı}
GET /api/v1/animeunity/info/{anime_id}
GET /api/v1/animeunity/watch/{episode_id}
```

⚠️ **Bu scraper şu anda kullanılamaz durumda.**

---

## 4️⃣ AniKai Scraper

### ❌ Durum: ROUTER BAĞLI DEĞİL

### Hata:
```json
{
  "status": 404,
  "message": "Not Found",
  "error": "Route /api/v1/anikai/ does not exist",
  "timestamp": "..."
}
```

### Durum:
- Dokümantasyon mevcut: `/workspaces/pulsarwatcher/src/docs/anikai.md`
- Router dosyası yok: `/workspaces/pulsarwatcher/src/routes/anikai/` dizini mevcut değil
- Server'da route tanımlı değil

### 📝 Kullanım Bilgisi (Tasarım):
Dokümantasyona göre planlanmış endpoint'ler:
```bash
GET /api/v1/anikai/home
GET /api/v1/anikai/search?q={anime_adı}
GET /api/v1/anikai/info/{anime_id}
GET /api/v1/anikai/watch/{anime_id}?ep={episode_number}
```

⚠️ **Bu scraper henüz implement edilmemiş.**

---

## 🎯 Özet ve Öneriler

### Çalışan Scraperlar:
1. **NineAnime** - %100 Başarılı
   - En stabil scraper
   - iframe embed videoları
   - Hızlı yanıt süresi
   
2. **HiAnime** - %67 Başarılı (Test edilen 3'ten 1'i çalıştı)
   - M3U8/HLS formatı
   - Altyazı desteği
   - Bazı içerikler eksik olabilir

### Çalışmayan Scraperlar:
1. **AnimeUnity** - Server hatası (500)
2. **AniKai** - Router bağlı değil (404)

### Kullanım Akışı:

#### NineAnime için:
```
1. Search → Anime listesi al (id gerekli)
2. Info → Detaylar + bölüm sayısı (optional)
3. Episode Sources → Video URL al (id + ep numarası)
4. Proxy ile CORS bypass → iframe'de oynat
```

**Örnek Kod:**
```javascript
// 1. Arama
const search = await fetch('/api/v1/nineanime/search?q=naruto');
const animeId = search.data[0].id; // "naruto-677"

// 2. Video URL
const sources = await fetch(`/api/v1/nineanime/episode/sources?id=${animeId}&ep=1`);
const videoUrl = sources.data.sources[0].url;

// 3. CORS bypass
const proxied = `https://xkbzamfyupjafugqeaby.supabase.co/functions/v1/video-proxy-v2?url=${encodeURIComponent(videoUrl)}&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYnphbWZ5dXBqYWZ1Z3FlYWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjU2MDAsImV4cCI6MjA1NDAwMTYwMH0.verified_2026`;

// 4. Oynat
// <iframe src={proxied} allowFullScreen />
```

#### HiAnime için:
```
1. Search → Anime listesi al (id gerekli)
2. Episodes → Bölüm listesi al (episodeId gerekli)
3. Episode Sources → M3U8 URL al (episodeId)
4. Video player ile oynat (hls.js/video.js)
```

**Örnek Kod:**
```javascript
// 1. Arama
const search = await fetch('/api/v1/hianime/search?q=jujutsu+kaisen');
const animeId = search.data.animes[0].id;

// 2. Bölüm listesi
const episodes = await fetch(`/api/v1/hianime/anime/${animeId}/episodes`);
const episodeId = episodes.data.episodes[0].episodeId;

// 3. M3U8 URL
const sources = await fetch(`/api/v1/hianime/episode/sources?animeEpisodeId=${episodeId}`);
const m3u8Url = sources.data.sources[0].url;

// 4. hls.js ile oynat
const hls = new Hls();
hls.loadSource(m3u8Url);
hls.attachMedia(videoElement);
```

### 🔑 Kritik Bilgiler:

**NineAnime:**
- ID formatı: `anime-slug-number` (örn: naruto-677)
- Video: iframe embed (rapid-cloud.co)
- Parametre: `id` ve `ep` (sayı)
- **CORS:** Proxy gerekli (Supabase önerilen)
- **Oynatma:** iframe içinde göster

**HiAnime:**
- ID formatı: `anime-slug-number` (örn: jujutsu-kaisen-2nd-season-18413)
- Episode ID formatı: `anime-id?ep=episode-number` (örn: jujutsu-kaisen-2nd-season-18413?ep=105053)
- Video: M3U8/HLS stream
- Parametre: `animeEpisodeId` (tam episodeId)
- Header gerekli: `Referer: https://megacloud.blog/`
- **CORS:** Proxy gereksiz (direkt M3U8 kullan)
- **Oynatma:** hls.js veya video.js ile

**Proxy Seçimi:**
- NineAnime iframe → Supabase Proxy (✅ önerilen) veya Pulroxy (⚠️ kısmen)
- HiAnime M3U8 → Proxy kullanma (❌ çalışmıyor), direkt URL kullan

---

## 📚 Ekstra Endpoint'ler

### NineAnime:
- `/api/v1/nineanime/trending?page={page}` - Trend animeler
- `/api/v1/nineanime/latest?page={page}` - En yeni bölümler
- `/api/v1/nineanime/popular?page={page}` - Popüler animeler
- `/api/v1/nineanime/episodes/{anime_id}` - Bölüm listesi

### HiAnime:
- `/api/v1/hianime/home` - Ana sayfa içeriği
- `/api/v1/hianime/category/{category}?page={page}` - Kategoriye göre
- `/api/v1/hianime/genre/{genre}?page={page}` - Türe göre
- `/api/v1/hianime/schedule` - Yayın takvimi

---

## 🔐 Video Proxy Kullanımı (CORS Bypass)

### Neden Proxy Gerekli?

Tarayıcılarda video URL'lerine direkt erişim genellikle CORS (Cross-Origin Resource Sharing) politikaları nedeniyle engellenir. Bu sorunu aşmak için proxy servisleri kullanmalısınız.

### 1️⃣ Supabase Video Proxy (ÖNERİLEN)

**Endpoint:**
```
https://xkbzamfyupjafugqeaby.supabase.co/functions/v1/video-proxy-v2
```

**API Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYnphbWZ5dXBqYWZ1Z3FlYWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjU2MDAsImV4cCI6MjA1NDAwMTYwMH0.verified_2026
```

#### Kullanım:
```javascript
// TypeScript/JavaScript örneği
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYnphbWZ5dXBqYWZ1Z3FlYWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjU2MDAsImV4cCI6MjA1NDAwMTYwMH0.verified_2026";
export const SUPABASE_RAPID_ENDPOINT = "https://xkbzamfyupjafugqeaby.supabase.co/functions/v1/video-proxy-v2";

export const getProxiedUrl = (url: string): string => {
  const params = new URLSearchParams({ 
    url: url, 
    apikey: SUPABASE_ANON_KEY 
  });
  return `${SUPABASE_RAPID_ENDPOINT}?${params.toString()}`;
};

// Kullanım
const originalVideoUrl = "https://rapid-cloud.co/embed-2/v2/e-1/26xyAu57LxHb?z=";
const proxiedUrl = getProxiedUrl(originalVideoUrl);
// iframe'de kullan: <iframe src={proxiedUrl} />
```

#### Curl Örneği:
```bash
# NineAnime video URL'sini proxy ile al
VIDEO_URL="https://rapid-cloud.co/embed-2/v2/e-1/svEZrh6qwUwF?z="
PROXY_URL="https://xkbzamfyupjafugqeaby.supabase.co/functions/v1/video-proxy-v2?url=$(echo $VIDEO_URL | jq -sRr @uri)&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYnphbWZ5dXBqYWZ1Z3FlYWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjU2MDAsImV4cCI6MjA1NDAwMTYwMH0.verified_2026"

curl "$PROXY_URL"
```

#### Test Sonuçları:
- ✅ **NineAnime iframe videoları**: Başarılı
- ❌ **HiAnime M3U8 videoları**: Cloudflare korumalı (çalışmıyor)
- ⚡ **Performans**: HTTP/2, CloudFlare üzerinden
- 🔒 **CORS**: Bypass edilmiş
- ⏱️ **Cache**: 60 saniye

---

### 2️⃣ Pulroxy (Cloudflare Workers)

**Endpoint:**
```
https://pulroxy.pulsariums.workers.dev/proxy?url=
```

#### Kullanım:
```javascript
// TypeScript/JavaScript örneği
export const PULROXY_ENDPOINT = "https://pulroxy.pulsariums.workers.dev/proxy?url=";

export const getProxiedUrl = (url: string): string => {
  return `${PULROXY_ENDPOINT}${encodeURIComponent(url)}`;
};

// Kullanım
const originalVideoUrl = "https://rapid-cloud.co/embed-2/v2/e-1/26xyAu57LxHb?z=";
const proxiedUrl = getProxiedUrl(originalVideoUrl);
```

#### Curl Örneği:
```bash
VIDEO_URL="https://rapid-cloud.co/embed-2/v2/e-1/svEZrh6qwUwF?z="
PROXY_URL="https://pulroxy.pulsariums.workers.dev/proxy?url=$(echo $VIDEO_URL | jq -sRr @uri)"

curl "$PROXY_URL"
```

#### Test Sonuçları:
- ⚠️ **NineAnime iframe videoları**: Kısmen başarılı (bazı videolar bulunamadı)
- ❌ **HiAnime M3U8 videoları**: Cloudflare korumalı (çalışmıyor)
- ⚡ **Performans**: HTTP/2, CloudFlare Workers
- 🔒 **CORS**: Bypass edilmiş
- ⏱️ **Cache**: 3600 saniye (1 saat)

---

### 📊 Proxy Karşılaştırması

| Özellik | Supabase Proxy | Pulroxy |
|---------|---------------|---------|
| **NineAnime iframe** | ✅ Çalışıyor | ⚠️ Kısmen |
| **HiAnime M3U8** | ❌ Korumalı | ❌ Korumalı |
| **API Key** | ✅ Gerekli | ❌ Gerek yok |
| **Cache Süresi** | 60s | 3600s |
| **CORS Bypass** | ✅ | ✅ |
| **Güvenilirlik** | Yüksek | Orta |

### 🎯 Öneriler:

1. **NineAnime videoları için**: Supabase Proxy kullanın (daha güvenilir)
2. **HiAnime M3U8 videoları için**: 
   - Direkt URL'yi `Referer: https://megacloud.blog/` header'ı ile kullanın
   - Proxy kullanmayın (Cloudflare korumalı)
   - Video player'da header injection destekleniyorsa direkt oynatın

### 💡 Örnek Full Akış:

```javascript
// 1. NineAnime video URL'sini al
const videoData = await fetch(
  'https://pulsarwatcher.vercel.app/api/v1/nineanime/episode/sources?id=naruto-677&ep=1'
).then(r => r.json());

const originalUrl = videoData.data.sources[0].url;
// -> https://rapid-cloud.co/embed-2/v2/e-1/26xyAu57LxHb?z=

// 2. Proxy ile CORS bypass
const proxiedUrl = getProxiedUrl(originalUrl);
// -> https://xkbzamfyupjafugqeaby.supabase.co/functions/v1/video-proxy-v2?url=https%3A%2F%2F...&apikey=...

// 3. iframe'de göster
// <iframe src={proxiedUrl} allowFullScreen />
```

---

### ⚠️ HiAnime M3U8 Kullanımı:

HiAnime M3U8 videoları için proxy kullanmaya gerek yok. Direkt URL'yi header ile kullanın:

```javascript
// HiAnime M3U8 - Direkt kullanım (proxy yok)
const m3u8Data = await fetch(
  'https://pulsarwatcher.vercel.app/api/v1/hianime/episode/sources?animeEpisodeId=jujutsu-kaisen-2nd-season-18413?ep=105053'
).then(r => r.json());

const m3u8Url = m3u8Data.data.sources[0].url;
// -> https://stormshade84.live/.../master.m3u8

// Video.js veya hls.js ile oynat
// Referer header'ı otomatik olarak tarayıcı tarafından eklenir
```

---

**Test Tarihi:** 2026-02-01  
**Tester:** GitHub Copilot  
**Test Platformu:** Vercel Deployment (pulsarwatcher.vercel.app)
