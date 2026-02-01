# Eklenebilir Özellikler Listesi
*Son güncelleme: 1 Şubat 2026*

## 🎯 Özet
Bu dokümanda tüm scraper'lar için eklenebilecek özellikler listelenmektedir.

---

## 1. NineAnime (9animetv.to)
**Mevcut Özellikler:**
- ✅ search - Anime arama
- ✅ trending - Trend olan animeler (35 anime)
- ✅ latest - En yeni bölümler (35 anime)
- ✅ popular - En popüler animeler (35 anime) *[YENİ EKLENDI]*
- ✅ info - Anime detayları
- ✅ episodes - Bölüm listesi
- ✅ sources - İzleme kaynakları

**Eklenebilir Özellikler:**
- ❌ **Genre Filter** - Filter endpoint'i JavaScript ile render ediliyor, statik scraping çalışmıyor
- ❌ **Type Filter** (TV, Movie, OVA) - Filter endpoint'i JavaScript ile render ediliyor
- ❌ **Seasonal Filter** - Filter endpoint'i parametreleri desteklemiyor
- ❌ **Status Filter** (Ongoing, Completed) - Filter endpoint'i çalışmıyor
- ⚠️ **Multi-server support** - Vidstreaming, MyCloud gibi alternatif sunucular eklenebilir

**Not:** NineAnime sitesi filter parametrelerini JavaScript ile işliyor ve statik scraping ile bu filtrelere erişim zor. Mevcut çalışan endpoint'ler yeterli kapsamda veri sağlıyor (search, trending, latest, popular).

---

## 2. HiAnime (aniwatch / hianime.to)
**Mevcut Özellikler:**
- ✅ home - Spotlight + trending (40 anime)
- ✅ search - Gelişmiş arama
- ✅ search/suggestion - Arama önerileri
- ✅ category - 13 kategori (most-popular, most-favorite, completed, movie, tv, ova, ona, special, subbed, dubbed, chinese, recently-added, recently-updated)
- ✅ genre - Genre bazlı filtreleme
- ✅ producer - Stüdyo bazlı filtreleme
- ✅ schedule - Yayın takvimi (date parametresi gerekli)
- ✅ anime/info - Detaylı anime bilgisi
- ✅ episode/servers - Sunucu listesi
- ✅ episode/sources - İzleme kaynakları
- ✅ episode/sources-with-quality - M3U8 kalite ayrıştırması *[YENİ EKLENDI]*
- ✅ anime/episodes - Bölüm listesi
- ✅ anime/next-episode-schedule - Sonraki bölüm takvimi

**Eklenebilir Özellikler:**
- 🟢 **Latest episodes** - En yeni bölümleri listele (category/recently-updated zaten var ama ayrı endpoint olarak eklenebilir)
- 🟢 **Popular by genre** - Genre + popularity kombinasyonu
- 🟢 **Advanced filters** - Year, season, format kombinasyonları
- 🟢 **Watch history** - Kullanıcı izleme geçmişi (authentication gerekir)
- 🟢 **Recommendations** - Anime önerileri (aniwatch API'de var mı araştırılmalı)

**Durum:** HiAnime en kapsamlı scraper. Aniwatch package üzerinden çalışıyor ve çok geniş özellik seti var. Ek özellikler minimal değer sağlar.

---

## 3. AniList (GraphQL API)
**Mevcut Özellikler:**
- ✅ search - Anime arama (20 sonuç)
- ✅ info - Detaylı anime bilgisi (GraphQL)
- ✅ trending - Trend olan animeler (20 anime)
- ✅ popular - En popüler animeler (20 anime)
- ✅ schedule - Yayın takvimi (airingAt bilgisi)

**Eklenebilir Özellikler:**
- 🟢 **Seasonal anime** - Season + year ile anime listele
  ```graphql
  media(season: WINTER, seasonYear: 2026, type: ANIME)
  ```
- 🟢 **Top rated** - En yüksek puanlı animeler
  ```graphql
  media(sort: SCORE_DESC, type: ANIME)
  ```
- 🟢 **Upcoming anime** - Yaklaşan animeler
  ```graphql
  media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC)
  ```
- 🟢 **Genre based search** - Genre filtreli arama
  ```graphql
  media(genre_in: ["Action", "Adventure"])
  ```
- 🟢 **Studio search** - Stüdyo bazlı arama
  ```graphql
  media(studios: "Ufotable")
  ```
- 🟢 **User stats** - Kullanıcı anime listesi (authentication gerekir)
- 🟢 **Character info** - Karakter bilgileri
- 🟢 **Staff info** - Yapımcı/seslendirmen bilgileri

**Durum:** AniList GraphQL API çok güçlü. Birçok ek özellik kolayca eklenebilir.

---

## 4. GogoAnime (anitaku.pe)
**Mevcut Özellikler:**
- ✅ search - Anime arama
- ✅ info - Anime detayları
- ✅ episodes - Bölüm listesi
- ✅ sources - İzleme kaynakları
- ✅ recent - Son eklenen bölümler

**Eklenebilir Özellikler:**
- 🟡 **Popular anime** - Popüler animeler (CloudFlare blocking nedeniyle zor)
- 🟡 **Genre list** - Genre bazlı listeleme
- 🟡 **New season** - Yeni sezon animeleri
- 🟡 **Completed anime** - Tamamlanmış animeler
- 🟡 **Ongoing anime** - Devam eden animeler

**Sorun:** GogoAnime CloudFlare protection kullanıyor. Scraping zor olabilir. Mevcut endpoint'ler bile bazen bloklanabiliyor.

**Durum:** CloudFlare bypass olmadan yeni özellik eklemek riskli.

---

## 5. Regional Providers (Hindi/Turkish/vb.)

### AnimeHindiDubbed
**Mevcut:** home, category, search, anime/info
**Eklenebilir:** 
- 🟢 Latest episodes
- 🟢 Popular anime
- 🟢 Genre filter

### DesiDubAnime
**Mevcut:** home, search, anime, watch
**Eklenebilir:**
- 🟢 Trending
- 🟢 Latest updates
- 🟢 Categories

### Animeya (Turkish)
**Mevcut:** home, search, info, watch
**Eklenebilir:**
- 🟢 Popular anime
- 🟢 Latest episodes
- 🟢 Genre filter
- 🟢 Completed anime

### Animelok (Indonesia)
**Mevcut:** home, schedule, languages, anime, watch
**Eklenebilir:**
- 🟢 Popular by language
- 🟢 Trending anime
- 🟢 Latest updates

### WatchAnimeWorld
**Mevcut:** home, search, episode, parse
**Eklenebilir:**
- 🟢 Trending
- 🟢 Latest episodes
- 🟢 Popular anime

**Durum:** Regional provider'lar genelde daha basit. Trending/latest/popular gibi standart endpoint'ler eklenebilir.

---

## 6. AnimeUnity (animeunity.so)
**Mevcut:** search, info, episode, trending
**Durum:** ⚠️ Site yapısı değişti, mevcut scraper çalışmıyor
**Aksiyon:** Önce mevcut özellikleri düzelt, sonra yeni özellik ekle

---

## 7. Utility Endpoints

### Anime-API (External)
**Mevcut:** quotes/random, images, facts, waifu
**Eklenebilir:**
- 🟢 Character database
- 🟢 Anime recommendations
- 🟢 Episode tracking
- 🟢 MAL integration

---

## 🎯 ÖNCELİKLİ EKLEMELER

### Yüksek Öncelik (Kolay + Değerli)
1. **AniList Seasonal** - GraphQL ile kolay, çok kullanışlı
2. **AniList Top Rated** - GraphQL ile kolay
3. **AniList Upcoming** - GraphQL ile kolay
4. **HiAnime Latest Episodes** - Ayrı endpoint olarak (category/recently-updated'den farklı)

### Orta Öncelik (Orta Zorluk)
5. **Regional providers'a trending/popular** - Her birine ayrı ayrı
6. **AniList Genre filter** - GraphQL parametreleri
7. **GogoAnime Popular** (CloudFlare bypass gerekebilir)

### Düşük Öncelik (Zor veya Az Değerli)
8. NineAnime filter endpoint'leri (JavaScript rendering sorunu)
9. Authentication gerektiren özellikler (user lists, watch history)
10. AnimeUnity düzeltmeleri

---

## 📊 İSTATİSTİKLER

**Toplam Scraper:** 10+
**Toplam Endpoint:** 70+
**Çalışan Scraper:** 8
**Eklenebilir Özellik:** 30+

**En Kapsamlı:** HiAnime (14 endpoint)
**En Basit:** WatchAnimeWorld (4 endpoint)
**En Sorunlu:** AnimeUnity (site değişti), GogoAnime (CloudFlare)

---

## 🔧 TEKNİK NOTLAR

1. **M3U8 Parser** - Zaten ekli, diğer scraper'lara da uygulanabilir
2. **Cache System** - Redis + LRU hybrid, tüm endpoint'lerde aktif
3. **Rate Limiting** - Mevcut, yeni endpoint'ler için otomatik çalışır
4. **Error Handling** - Standardize edilmiş, yeni endpoint'ler için kullanılabilir

---

## 🚀 SONRAKI ADIMLAR

1. ✅ NineAnime popular eklendi (95cbfc6)
2. ⏭️ AniList seasonal, top-rated, upcoming ekle
3. ⏭️ Regional providers'a trending/popular ekle
4. ⏭️ M3U8 parser'ı diğer scraper'lara uygula
5. ⏭️ AnimeUnity'yi düzelt
6. ⏭️ GogoAnime CloudFlare bypass araştır
