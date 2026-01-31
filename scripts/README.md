# 📚 Script Tools untuk Database Management

## 🔄 Script Migrasi & Import

### **import-all-from-sql.mjs** ⭐ PENTING
Script utama untuk import data dari MySQL SQL dump ke PostgreSQL.
```bash
node scripts/import-all-from-sql.mjs
```

**Fungsi:**
- Baca file SQL dari `d:\Downloads\barizta (15).sql`
- Parse INSERT statements otomatis
- Import ke PostgreSQL dengan upsert (no duplicate)
- Support semua tabel: categories, products, users, classes, dll

---

### **clean-test-data.mjs**
Bersihkan data test/sample yang tidak diperlukan.
```bash
node scripts/clean-test-data.mjs
```

**Fungsi:**
- Hapus products test (slug: *-seed)
- Hapus categories test (Signature, Special, Klasik)
- Hapus team test (JACKSON, WAHYU, FELIX)
- Hapus news test
- Keep data dari MySQL import

---

## 🌱 Script Seeding (Opsional)

### **seed-all-prisma.mjs**
Seed data sample untuk testing.
```bash
npm run seed:all
```

### **reset-member-password.mjs**
Reset password member untuk testing.
```bash
node scripts/reset-member-password.mjs
```

---

## 🛠️ Script Setup

### **setup-postgresql.ps1**
Setup database PostgreSQL dari awal.
```powershell
.\scripts\setup-postgresql.ps1
```

**Fungsi:**
- Buat database baru
- Buat user baru
- Grant privileges

---

## 📋 Cara Penggunaan

### 1️⃣ **Migrasi MySQL → PostgreSQL**

```bash
# 1. Pastikan file SQL ada di Downloads
# 2. Jalankan import
node scripts/import-all-from-sql.mjs

# 3. Verify di Prisma Studio
npx prisma studio
```

### 2️⃣ **Bersihkan Data Test**

```bash
node scripts/clean-test-data.mjs
```

### 3️⃣ **Reset Database (Hati-hati!)**

```bash
# Reset semua data dan migrasi
npx prisma migrate reset

# Lalu import ulang
node scripts/import-all-from-sql.mjs
```

---

## ⚠️ Catatan Penting

1. **Backup file SQL** - Simpan `barizta (15).sql` di tempat aman
2. **Script import** - `import-all-from-sql.mjs` adalah file PENTING, jangan hapus!
3. **Database URL** - Pastikan `.env` sudah benar:
   ```
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/barizta"
   ```

---

## 🔍 Troubleshooting

**Error: File tidak ditemukan**
- Copy file SQL ke `d:\Downloads\barizta (15).sql`
- Atau ubah path di script

**Error: Unique constraint**
- Normal, skip record yang sudah ada
- Gunakan upsert untuk update

**Error: Invalid date**
- Script sudah handle konversi date otomatis
- Cek format date di SQL file

---

**Dibuat:** 31 Januari 2026
**Database:** PostgreSQL 16
**Framework:** Prisma ORM
