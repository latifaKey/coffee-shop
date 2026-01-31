# 🎯 File Penting - JANGAN HAPUS!

## ⭐ Script Kritis untuk Migrasi Database

### 1. **import-all-from-sql.mjs** 🔴 SANGAT PENTING
**Lokasi:** `scripts/import-all-from-sql.mjs`

**Fungsi:** Import SEMUA data dari MySQL SQL dump ke PostgreSQL
- Auto-parse INSERT statements
- Support semua tabel (categories, products, users, classes, dll)
- Handle 250+ records sekaligus
- Upsert (tidak duplikat)

**Cara Pakai:**
```bash
node scripts/import-all-from-sql.mjs
```

**Dependency:**
- File SQL: `d:\Downloads\barizta (15).sql`
- PostgreSQL running
- DATABASE_URL di .env

---

### 2. **clean-test-data.mjs** 🟡 PENTING
**Lokasi:** `scripts/clean-test-data.mjs`

**Fungsi:** Bersihkan data test/sample
- Hapus products test (slug: *-seed)
- Hapus data seeding temporary
- Keep data dari MySQL import

---

### 3. **setup-postgresql.ps1** 🟡 PENTING
**Lokasi:** `scripts/setup-postgresql.ps1`

**Fungsi:** Setup database PostgreSQL dari awal
- Buat database baru
- Buat user & grant privileges

---

## 📁 File Lainnya (Opsional)

### Seeding Scripts
- `seed-all-prisma.mjs` - Seed data sample
- `seed-products-prisma.mjs` - Seed products
- `seed-team-prisma.mjs` - Seed team
- `seed-news-prisma.mjs` - Seed news

### Utility Scripts
- `reset-member-password.mjs` - Reset password member
- `update-menu-prices-dec2025.mjs` - Update harga menu
- `sync-public-data.mjs` - Sync data public

### Legacy (Bisa dihapus jika tidak dipakai)
- `setup-mysql.ps1` - Setup MySQL (legacy)
- `create-product.js` - Create product manual
- `post-product-api.js` - Test API

---

## 🗑️ Aman untuk Dihapus

File-file ini bisa dihapus jika tidak terpakai:
- `setup-mysql.ps1` (sudah migrasi ke PostgreSQL)
- `create-product.js` (manual script)
- `post-product-api.js` (testing script)
- `list-products.mjs` (debugging)

---

## 💾 Backup Penting

**File yang WAJIB di-backup:**
1. ✅ `barizta (15).sql` - SQL dump MySQL asli
2. ✅ `import-all-from-sql.mjs` - Script import
3. ✅ `.env` - Database credentials
4. ✅ `prisma/schema.prisma` - Schema database

---

## 📝 Catatan Migrasi

**Status:** ✅ Berhasil
**Tanggal:** 31 Januari 2026
**Database:** MySQL → PostgreSQL 16
**Records:** 250+ data berhasil di-import

**Yang berhasil di-import:**
- 10 Categories
- 50+ Products
- 21 Class Registrations
- 82 Notifications
- 8 Team Members
- 3 Users
- 26 Kolaborasi Settings
- 3 Partnerships
- 5 Milestones
- Dan lainnya

---

## 🚨 Peringatan

**JANGAN:**
- ❌ Hapus `import-all-from-sql.mjs`
- ❌ Hapus `barizta (15).sql` dari Downloads
- ❌ Ubah DATABASE_URL tanpa backup

**BOLEH:**
- ✅ Hapus file seeding test
- ✅ Hapus script legacy MySQL
- ✅ Update utility scripts

---

**Dokumentasi:** `scripts/README.md`
