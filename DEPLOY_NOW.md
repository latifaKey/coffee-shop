# ✅ Quick Deployment Guide

## 🚀 Deploy ke Vercel (5 Menit!)

### Step 1: Generate JWT Secret Baru
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy hasilnya!

### Step 2: Push ke GitHub
```bash
git add .
git commit -m "Production ready - all security & performance fixes"
git push origin main
```

### Step 3: Deploy ke Vercel

1. Buka https://vercel.com dan login
2. Click "Import Project"
3. Pilih repository barizta-coffee
4. Tambahkan Environment Variables:

```env
DATABASE_URL=your-production-postgresql-url
JWT_SECRET=paste-hasil-step-1-di-sini
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
RESEND_API_KEY=re_xxxxx (optional)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NODE_ENV=production
```

5. Click "Deploy"!

### Step 4: Run Database Migration

Setelah deploy sukses, buka Vercel Dashboard → Settings → Environment Variables, lalu:

```bash
# Di terminal local:
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### Step 5: Test!

Buka: `https://your-app.vercel.app`

---

## 🐳 Alternative: Railway

### Step 1: Buat Akun Railway

https://railway.app

### Step 2: New Project from GitHub

1. Connect GitHub repository
2. Railway auto-detect Next.js

### Step 3: Add PostgreSQL

1. Click "New" → Database → PostgreSQL
2. Railway auto-connect DATABASE_URL

### Step 4: Add Environment Variables

Same as Vercel (kecuali DATABASE_URL sudah auto)

### Step 5: Deploy!

Auto-deploy setiap push ke GitHub.

---

## ✅ Post-Deployment Checklist

- [ ] Website bisa diakses
- [ ] Login admin works
- [ ] Register member works  
- [ ] Create product works
- [ ] Email notification works
- [ ] Certificate generation works
- [ ] Images load properly

---

## 🔧 Troubleshooting

### Build Error: "Cannot find module"
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Database Connection Failed
- Check DATABASE_URL format
- Verify IP whitelist (for AWS RDS/Cloud SQL)
- Test: `npx prisma db pull`

### Images Not Loading
- Check `next.config.ts` remotePatterns
- Verify /public folder uploaded
- Check image paths

---

## 📊 What's Next?

### Immediate (Week 1):
- [ ] Monitor errors (setup Sentry free tier)
- [ ] Check performance (Google PageSpeed)
- [ ] Test with real users (beta)

### Later (When traffic grows):
- [ ] Add Redis for rate limiting
- [ ] Setup CDN (Cloudflare)
- [ ] Add monitoring (UptimeRobot)

---

**Semua file sudah siap! Tinggal deploy! 🚀**
