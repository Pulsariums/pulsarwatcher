# Tatakai API - Deployment Guide

## 🚀 Vercel Deployment (Recommended)

### 1. GitHub'a Push Et

```bash
# GitHub repo'zu oluştur veya fork et
git init
git add .
git commit -m "Initial commit with NineAnime support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TatakaiAPI.git
git push -u origin main
```

### 2. Vercel'e Deploy Et

```bash
# Option A: Vercel CLI ile
npm install -g vercel
vercel

# Option B: GitHub'dan
# 1. https://vercel.com adresine git
# 2. "New Project" tıkla
# 3. GitHub repo'nu seç
# 4. Deploy et
```

### 3. Environment Variables

Vercel dashboard'ta ekle:
```
PORT=4000
NODE_ENV=production
DEPLOYMENT_ENV=vercel
CORS_ALLOWED_ORIGINS=*
REDIS_URL=                          (optional)
SUPABASE_URL=                       (optional - WatchAW için)
SUPABASE_AUTH_KEY=                  (optional)
```

### 4. Test

```bash
https://your-project.vercel.app/api/v1/hianime/search?q=frieren
https://your-project.vercel.app/api/v1/nineanime/search?q=frieren
https://your-project.vercel.app/docs
```

---

## 🐳 Docker Deployment

```bash
# Build
docker build -t tatakai-api .

# Run
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e PORT=4000 \
  tatakai-api
```

---

## 📦 Local Development

```bash
npm install
npm run dev

# Test
curl http://localhost:4000/api/v1/hianime/search?q=frieren
curl http://localhost:4000/api/v1/nineanime/search?q=frieren
```

---

## 🌐 Providers

| Provider | Endpoint | Status |
|----------|----------|--------|
| HiAnime | `/api/v1/hianime/*` | ✅ |
| NineAnime | `/api/v1/nineanime/*` | ✅ NEW |
| WatchAW | `/api/v1/watchaw/*` | ✅ |
| HindiDubbed | `/api/v1/hindidubbed/*` | ✅ |
| AnimeLok | `/api/v1/animelok/*` | ✅ |
| Animeya | `/api/v1/animeya/*` | ✅ |
| Utility | `/api/v1/anime-api/*` | ✅ |

---

## 🔧 Troubleshooting

**Build fails on Vercel**
- Node version: 18+ required
- Memory: Increase to 1024+ MB

**API returns 500 error**
- Check logs: `vercel logs`
- Check environment variables
- Restart deployment

**NineAnime returns 0 results**
- HTML parser might need update
- Check NineAnime.com HTML structure
- Update selectors in `src/routes/nineanime/index.ts`

---

## 📚 Resources

- Tatakai GitHub: https://github.com/Snozxyx/TatakaiAPI
- Vercel Docs: https://vercel.com/docs
- Hono Framework: https://hono.dev

---

**Last Updated**: 2026-02-01
