# 🚀 Deployment Checklist - BARIZTA Coffee

## ❌ **BLOCKER - HARUS SELESAI SEBELUM HOSTING**

### 1. ⚠️ **SECURITY: Rate Limiting**
**Status:** ❌ **BELUM ADA**

**File:** `src/app/api/auth/login/route.ts`

**Problem:** Login endpoint tidak ada proteksi brute force attack.

**Fix Options:**

**A. Gunakan Upstash (Recommended):**
```bash
npm install @upstash/ratelimit @upstash/redis
```

Tambahkan ke `.env`:
```env
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**B. In-Memory (Simple, tapi tidak ideal untuk production):**
```typescript
// Di route.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const record = attempts.get(ip);
  
  if (record && record.resetAt > now) {
    if (record.count >= 5) return false;
    record.count++;
  } else {
    attempts.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute
  }
  return true;
};
```

**Priority:** 🔴 **CRITICAL**

---

### 2. ⚡ **PERFORMANCE: Canvas Lazy Loading**
**Status:** ❌ **BUNDLE BLOAT 3MB+**

**File:** Cari file yang import `canvas` library

**Fix:**
```typescript
// ❌ BEFORE
import { createCanvas, loadImage } from 'canvas';

// ✅ AFTER
const generateCertificate = async () => {
  const { createCanvas, loadImage } = await import('canvas');
  // ... rest of code
};
```

**Test setelah fix:**
```bash
npm run build
# Check bundle size di .next/static/chunks/
```

**Priority:** 🔴 **CRITICAL**

---

### 3. 🔐 **ENVIRONMENT VARIABLES**
**Status:** ⚠️ **PERLU DICEK**

**Checklist:**
- [ ] `.env` file ada di `.gitignore`
- [ ] `JWT_SECRET` di production harus beda dari development
- [ ] Generate JWT_SECRET baru:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Jangan commit `.env` ke Git!

**Priority:** 🔴 **CRITICAL**

---

### 4. 🏗️ **ARCHITECTURE: Admin Layout Client Component**
**Status:** ⚠️ **ARCHITECTURE ISSUE**

**File:** `src/app/admin/layout.tsx`

**Problem:** Layout adalah client component → semua children jadi client.

**Quick Fix (30 menit):**

Buat file baru `src/app/admin/AdminShell.tsx`:
```typescript
"use client";

import { useState } from "react";
// ... rest of current layout code

export default function AdminShell({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: { name: string; email: string; role: string };
}) {
  // Semua client logic di sini
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ... rest
  
  return (
    <div className="admin-container">
      {/* Sidebar, navbar, etc */}
      <main>{children}</main>
    </div>
  );
}
```

Update `src/app/admin/layout.tsx`:
```typescript
// ✅ HAPUS "use client"
import { getSessionFromCookies } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

export default async function AdminLayout({ children }) {
  const session = await getSessionFromCookies();
  
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }
  
  return <AdminShell initialUser={session}>{children}</AdminShell>;
}
```

**Priority:** 🟡 **MEDIUM** (tidak blocking, tapi sangat direkomendasikan)

---

## ⚠️ **STRONGLY RECOMMENDED - SEBELUM PRODUCTION**

### 5. 🛡️ **Input Validation dengan Zod**
**Status:** ❌ **TIDAK ADA**

**Install:**
```bash
npm install zod
```

**Contoh implementasi di `src/app/api/classes/route.ts`:**
```typescript
import { z } from 'zod';

const classSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  instructor: z.string().min(2),
  price: z.number().positive(),
  maxParticipants: z.number().int().positive(),
  // ... field lainnya
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate
  try {
    const validated = classSchema.parse(body);
    // Use validated data
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: err.errors 
      }, { status: 400 });
    }
  }
}
```

**Apply ke semua API routes:**
- `/api/auth/login`
- `/api/products`
- `/api/classes`
- `/api/enrollments`
- ... dst

**Priority:** 🟡 **HIGH**

---

### 6. 📊 **Error Tracking**
**Status:** ❌ **TIDAK ADA**

**Recommendation:** Sentry (free tier available)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Priority:** 🟡 **MEDIUM**

---

### 7. 🧪 **Testing - Minimal**
**Status:** ❌ **TIDAK ADA**

**Minimal setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test critical paths:**
- Login API
- Product CRUD
- Class registration

**Priority:** 🟢 **LOW** (untuk MVP, tapi wajib untuk scale)

---

## 📝 **PRE-DEPLOYMENT CHECKLIST**

### Database
- [ ] PostgreSQL production instance ready (AWS RDS, Supabase, Neon, dll)
- [ ] Connection pooling configured (Prisma Accelerate atau PgBouncer)
- [ ] Backup strategy in place
- [ ] Run migrations: `npx prisma migrate deploy`

### Environment
- [ ] All `.env` variables set di hosting platform (Vercel/Railway/AWS)
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` unique & strong
- [ ] Email credentials valid (Gmail App Password atau Resend API key)

### Build
- [ ] `npm run build` berhasil tanpa error
- [ ] Bundle size check: `du -sh .next/static/*`
- [ ] No TypeScript errors: `npm run lint`

### Security
- [ ] Rate limiting implemented
- [ ] HTTPS enabled (biasanya auto di Vercel/Netlify)
- [ ] CORS configured jika ada external API calls
- [ ] Sensitive routes protected di middleware

### Performance
- [ ] Images optimized (next/image used)
- [ ] Canvas lazy loaded
- [ ] Heavy libraries dynamic imported
- [ ] ISR/SSR configured properly

---

## 🎯 **RECOMMENDED HOSTING PLATFORMS**

### For MVP/Development:
1. **Vercel** (Recommended)
   - Auto-deploy dari GitHub
   - PostgreSQL via Neon/Supabase
   - Free tier: OK untuk testing
   - Edge network global

2. **Railway**
   - PostgreSQL built-in
   - Simple pricing
   - Good for fullstack

3. **Netlify**
   - Mirip Vercel
   - Alternative option

### For Production Scale:
1. **AWS (EC2 + RDS)**
2. **Google Cloud Run**
3. **Azure App Service**

---

## ⏱️ **ESTIMASI WAKTU PERBAIKAN**

| Task | Priority | Time | 
|------|----------|------|
| Rate limiting | 🔴 Critical | 2 jam |
| Canvas lazy load | 🔴 Critical | 1 jam |
| Env vars check | 🔴 Critical | 30 menit |
| Admin layout refactor | 🟡 High | 2 jam |
| Zod validation | 🟡 High | 4 jam |
| Error tracking setup | 🟡 Medium | 1 jam |
| **TOTAL MINIMUM** | | **6.5 jam** |
| **TOTAL RECOMMENDED** | | **10.5 jam** |

---

## ✅ **READY TO DEPLOY WHEN:**

1. ✅ Rate limiting implemented
2. ✅ Canvas lazy loaded
3. ✅ `.env` tidak ter-commit
4. ✅ `npm run build` success
5. ✅ Database production ready
6. ✅ Minimal testing passed

**Setelah fix blocker (1-3), web SUDAH BISA di-host untuk beta testing.**

**Untuk production penuh, selesaikan semua recommended items.**

---

## 📞 **SUPPORT & DEBUGGING**

### Common Deployment Issues:

**1. Build error: "Cannot find module"**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**2. Database connection failed**
- Check `DATABASE_URL` format
- Verify IP whitelist (jika AWS RDS/Cloud SQL)
- Test connection: `npx prisma db pull`

**3. Environment variables not working**
- Restart dev server after `.env` change
- Check hosting platform env vars UI
- Use `process.env.VARIABLE_NAME` not destructuring

**4. Images not loading**
- Check `next.config.ts` `remotePatterns`
- Verify image paths di `/public`

---

**Last Updated:** February 3, 2026
**Next Review:** Before production launch
