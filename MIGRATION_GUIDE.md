# 🔄 Migrasi MySQL ke PostgreSQL - Barizta Coffee

## ✅ Perubahan yang Telah Dilakukan

### 1. **File Konfigurasi**
- ✅ `prisma/schema.prisma` - Provider diubah dari `mysql` ke `postgresql`
- ✅ `.env` - DATABASE_URL diubah ke format PostgreSQL
- ✅ `package.json` - mysql2 diganti dengan pg
- ✅ `verify_indexes.sql` - Query disesuaikan untuk PostgreSQL

### 2. **Raw SQL Queries yang Diperbaiki**
- ✅ `src/app/api/classes/route.ts` - Placeholder `?` → `$1, $2`
- ✅ `src/app/api/classes/[id]/route.ts` - Placeholder `?` → `$1`
- ✅ `src/app/api/member/class-registrations/route.ts` - IN clause → ANY($1)
- ✅ `src/app/api/admin/class-registrations/route.ts` - IN clause → ANY($1)
- ✅ `scripts/reset-member-password.mjs` - mysql2 → Prisma Client

### 3. **Script Setup Baru**
- ✅ `scripts/setup-postgresql.ps1` - Script untuk setup database PostgreSQL

## 📋 Langkah Selanjutnya

### 1. Install PostgreSQL (jika belum)
Download dan install PostgreSQL dari: https://www.postgresql.org/download/windows/
- Default port: 5432
- Default user: postgres
- Catat password yang Anda buat

### 2. Install Dependencies
```powershell
npm install
```

### 3. Setup Database PostgreSQL
```powershell
.\scripts\setup-postgresql.ps1
```
Script akan meminta:
- Password postgres (admin)
- Password untuk user barizta_user

### 4. Generate Prisma Client
```powershell
npx prisma generate
```

### 5. Buat Database Schema
Pilih salah satu:

**Opsi A: Reset & Migrasi Baru (HAPUS DATA LAMA)**
```powershell
npx prisma migrate reset
npx prisma migrate dev --name init_postgresql
```

**Opsi B: Deploy Migrasi (Jika ada data penting di MySQL)**
```powershell
# Export data dari MySQL terlebih dahulu
npx prisma migrate deploy
```

### 6. Seed Database (Opsional)
```powershell
npm run seed:all
```

### 7. Jalankan Aplikasi
```powershell
npm run dev
```

## 🔍 Verifikasi

1. **Cek Koneksi Database:**
```powershell
npx prisma studio
```

2. **Cek Indexes:**
```powershell
# Jalankan query di PostgreSQL
psql -U postgres -d barizta -f verify_indexes.sql
```

3. **Test Aplikasi:**
- Login admin/member
- Test create/read class
- Test registrasi kelas
- Test payment proof upload

## 📊 Perubahan Teknis Detail

### DATABASE_URL Format
```env
# Sebelum (MySQL)
DATABASE_URL="mysql://root:@127.0.0.1:3306/barizta"

# Sesudah (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barizta"
```

### Raw SQL Placeholder
```typescript
// Sebelum (MySQL)
await prisma.$executeRawUnsafe(
  `UPDATE class SET totalSessions = ? WHERE id = ?`,
  value, id
);

// Sesudah (PostgreSQL)
await prisma.$executeRawUnsafe(
  `UPDATE class SET "totalSessions" = $1 WHERE id = $2`,
  value, id
);
```

### IN Clause untuk Array
```typescript
// Sebelum (MySQL)
prisma.$queryRaw`SELECT id FROM table WHERE id IN (${ids.join(',')})`

// Sesudah (PostgreSQL)
prisma.$queryRawUnsafe(`SELECT id FROM table WHERE id = ANY($1)`, ids)
```

## ⚠️ Catatan Penting

1. **Backup Data MySQL** - Sebelum migrasi, backup semua data MySQL Anda
2. **Case Sensitivity** - PostgreSQL case-sensitive untuk identifier, gunakan quotes untuk mixed case
3. **Column Names** - Gunakan double quotes untuk column names yang reserved atau mixed case
4. **Data Types** - Beberapa tipe data mungkin berbeda (misal: TINYINT → SMALLINT)

## 🔄 Migrasi Data dari MySQL ke PostgreSQL

Jika Anda ingin memindahkan data dari MySQL ke PostgreSQL:

1. **Export Data dari MySQL:**
```powershell
npx prisma db pull --schema=./prisma/schema-mysql.prisma
```

2. **Gunakan Tool Migrasi:**
- pgloader: https://pgloader.io/
- atau export ke CSV lalu import ke PostgreSQL

3. **Contoh menggunakan pgloader:**
```sql
LOAD DATABASE
     FROM mysql://root:@localhost:3306/barizta
     INTO postgresql://postgres:postgres@localhost:5432/barizta;
```

## 🐛 Troubleshooting

### Error: "relation does not exist"
```powershell
npx prisma migrate reset
npx prisma migrate dev
```

### Error: "password authentication failed"
Cek file .env, pastikan username dan password benar.

### Error: "connect ECONNREFUSED"
Pastikan PostgreSQL service berjalan:
```powershell
# Check service status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-16
```

## 📞 Support

Jika ada masalah:
1. Cek logs PostgreSQL di: `C:\Program Files\PostgreSQL\16\data\log`
2. Test koneksi: `psql -U postgres -d barizta`
3. Cek Prisma logs dengan environment variable: `DEBUG="prisma:*"`

---
**Tanggal Migrasi:** 31 Januari 2026
**Status:** ✅ Migrasi Berhasil - Siap untuk Testing
