# Panduan Setup Google OAuth Login

## 🎯 Overview
Panduan lengkap untuk mengaktifkan login dengan Google OAuth di aplikasi BARIZTA Coffee.

---

## 📋 Prerequisites

1. **Akun Google** - Untuk mengakses Google Cloud Console
2. **Next.js app sudah running** - Pastikan app berjalan di `http://localhost:3000`
3. **NextAuth.js terinstall** - Package `next-auth@beta` sudah terinstall

---

## 🚀 Langkah Setup

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Select a project** → **New Project**
3. Masukkan nama project: `BARIZTA Coffee`
4. Klik **Create**

### 2. Enable Google+ API

1. Dari menu sidebar, pilih **APIs & Services** → **Library**
2. Cari "Google+ API"
3. Klik **Google+ API**
4. Klik tombol **Enable**

### 3. Konfigurasi OAuth Consent Screen

1. Pilih **APIs & Services** → **OAuth consent screen**
2. Pilih **External** (untuk testing)
3. Klik **Create**

#### User Type: External
- **App name**: BARIZTA Coffee
- **User support email**: email Anda
- **Developer contact information**: email Anda
- Klik **Save and Continue**

#### Scopes
- Klik **Add or Remove Scopes**
- Pilih scope berikut:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Klik **Update** → **Save and Continue**

#### Test Users
- Tambahkan email Anda untuk testing
- Klik **Save and Continue**

### 4. Buat OAuth 2.0 Client ID

1. Pilih **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `BARIZTA Web Client`

#### Authorized JavaScript origins
```
http://localhost:3000
https://yourdomain.com (untuk production)
```

#### Authorized redirect URIs
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google (untuk production)
```

5. Klik **Create**
6. **IMPORTANT**: Simpan **Client ID** dan **Client Secret**

---

## 🔐 Setup Environment Variables

### 1. Copy dari .env.example

```bash
cp .env.example .env.local
```

### 2. Update .env.local

Tambahkan credentials dari Google Cloud Console:

```env
# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-below"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Generate NEXTAUTH_SECRET

Jalankan command berikut untuk generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output dan paste ke `NEXTAUTH_SECRET`

---

## 🔄 Update Prisma Schema

### 1. Modifikasi User Model

Update file `prisma/schema.prisma`:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String   // Bisa kosong untuk OAuth users
  role      String   @default("member")
  provider  String?  @default("credentials") // "google" atau "credentials"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  registrations  Registration[]
  cart           Cart?
  notifications  Notification[]

  @@index([email])
  @@index([role])
}
```

### 2. Jalankan Migration

```bash
npx prisma migrate dev --name add_oauth_support
```

---

## 📦 Update Login Page

Ganti file `src/app/auth/login/page.tsx` dengan:

```bash
# Backup file lama
mv src/app/auth/login/page.tsx src/app/auth/login/page-old.tsx

# Rename file baru
mv src/app/auth/login/page-with-google.tsx src/app/auth/login/page.tsx
```

---

## 🧪 Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Google OAuth Login

1. Buka `http://localhost:3000/auth/login`
2. Klik tombol **"Masuk dengan Google"**
3. Pilih akun Google Anda
4. Authorize aplikasi
5. Anda akan di-redirect ke `/member/dashboard`

### 3. Verifikasi di Database

```bash
npx prisma studio
```

Cek tabel `User`, pastikan:
- User baru dengan email Google sudah dibuat
- Field `provider` bernilai `"google"`
- Field `password` kosong

---

## 🎨 UI Features

### Google Sign-In Button
- ✅ Official Google colors dan branding
- ✅ Dark mode support
- ✅ Loading state dengan spinner
- ✅ Responsive design

### Divider "atau masuk dengan email"
- ✅ Visual separator antara OAuth dan email login
- ✅ Clean dan modern

### Dual Login Options
- ✅ Google OAuth (recommended)
- ✅ Email/Password (existing users)

---

## 🔒 Security Features

### Auto User Creation
- User baru otomatis dibuat saat first-time Google login
- Default role: `member`
- Password field kosong (tidak diperlukan)

### Session Management
- JWT strategy
- 7 days session expiry
- HTTP-only cookies

### Provider Tracking
- Setiap user punya field `provider`
- Credentials users: `"credentials"`
- Google users: `"google"`

---

## 🚀 Production Deployment

### 1. Update OAuth Redirect URIs

Di Google Cloud Console, tambahkan production URLs:

```
Authorized JavaScript origins:
https://barizta.com

Authorized redirect URIs:
https://barizta.com/api/auth/callback/google
```

### 2. Update Environment Variables

Di production environment (.env.production atau Vercel):

```env
NEXTAUTH_URL="https://barizta.com"
NEXTAUTH_SECRET="production-secret-here"
GOOGLE_CLIENT_ID="same-client-id"
GOOGLE_CLIENT_SECRET="same-client-secret"
```

### 3. Update OAuth Consent Screen

1. Kembali ke **OAuth consent screen**
2. Klik **Publish App** untuk make it public
3. Atau tambahkan test users untuk private testing

---

## 🛠️ Troubleshooting

### Error: redirect_uri_mismatch

**Problem**: Redirect URI tidak match dengan yang terdaftar di Google Console

**Solution**:
1. Cek di Google Cloud Console → Credentials
2. Pastikan `http://localhost:3000/api/auth/callback/google` ada di Authorized redirect URIs
3. Restart dev server

### Error: Access blocked: This app's request is invalid

**Problem**: OAuth consent screen belum dikonfigurasi

**Solution**:
1. Lengkapi OAuth consent screen configuration
2. Tambahkan email Anda sebagai test user
3. Enable Google+ API

### User created but password field required

**Problem**: Existing JWT middleware memerlukan password

**Solution**:
- Update validation schema untuk allow empty password pada Google users:

```typescript
// In src/lib/validation.ts
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(), // Make optional for OAuth
  provider: z.enum(["credentials", "google"]).optional(),
});
```

### Session not persisting

**Problem**: NEXTAUTH_SECRET tidak di-set

**Solution**:
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Set di .env.local
3. Restart server

---

## 📚 Reference

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 15 App Router](https://nextjs.org/docs/app)

---

## ✅ Checklist

### Setup
- [ ] Google Cloud Project dibuat
- [ ] OAuth consent screen dikonfigurasi
- [ ] OAuth 2.0 Client ID dibuat
- [ ] Redirect URIs ditambahkan

### Configuration
- [ ] .env.local updated dengan credentials
- [ ] NEXTAUTH_SECRET di-generate
- [ ] Prisma schema updated (provider field)
- [ ] Migration dijalankan

### Code
- [ ] src/lib/auth.ts created
- [ ] src/app/api/auth/[...nextauth]/route.ts created
- [ ] Login page updated dengan Google button
- [ ] CSS styles untuk Google button ditambahkan

### Testing
- [ ] Google login works
- [ ] User auto-created di database
- [ ] Session persists
- [ ] Redirect ke dashboard works

---

## 🎉 Selesai!

Aplikasi Anda sekarang support login dengan **Google OAuth** dan **Email/Password**!

Users dapat pilih metode login yang mereka sukai. 🚀
