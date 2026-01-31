# Dokumentasi Refactoring Payment Proof Upload

## Ringkasan Perubahan

Refactoring ini mengubah mekanisme penyimpanan bukti pembayaran dari **BLOB (Bytes)** di database menjadi **file system** dengan menyimpan **URL/path** di database.

## Motivasi

- **Performance**: Menyimpan file di database (BLOB) memperlambat query dan meningkatkan ukuran database
- **Scalability**: File system lebih efisien untuk menyimpan file besar
- **Best Practice**: Memisahkan data struktural (metadata) dari data binary (file)
- **Caching**: File statis lebih mudah di-cache oleh CDN atau reverse proxy

## Perubahan yang Dilakukan

### 1. Schema Database (schema.prisma)

**Sebelum:**
```prisma
model classregistration {
  // ... kolom lain
  paymentProof Bytes? // BLOB - menyimpan file binary
}
```

**Sesudah:**
```prisma
model classregistration {
  // ... kolom lain
  paymentProof String? // String - menyimpan URL/path file
}
```

### 2. Utility Function Upload ([src/lib/upload-utils.ts](src/lib/upload-utils.ts))

Dibuat 2 fungsi helper untuk upload:

#### `uploadFile(file: File, folder: string)`
- Menerima File object dari multipart/form-data
- Validasi tipe file (hanya JPEG, PNG, WebP)
- Validasi ukuran file (max 5MB)
- Generate nama file unik dengan timestamp + random string
- Simpan ke `public/{folder}/{filename}`
- Return URL publik untuk disimpan ke database

#### `uploadBase64(base64String: string, folder: string)`
- Untuk backward compatibility dengan client yang masih kirim base64
- Validasi dan konversi base64 ke Buffer
- Sama seperti uploadFile untuk validasi dan penyimpanan

### 3. API Routes

#### POST `/api/member/class-registrations` ([route.ts](src/app/api/member/class-registrations/route.ts))

**Perubahan:**
- Support 2 content type:
  - `multipart/form-data` (recommended) - langsung upload file
  - `application/json` (backward compatible) - terima base64 string
- Upload file menggunakan utility function
- Simpan URL file (bukan binary) ke database

**Contoh Request (multipart/form-data):**
```javascript
const formData = new FormData();
formData.append('programId', 'barista-basic');
formData.append('programName', 'Barista Basic Training');
formData.append('fullName', 'John Doe');
// ... field lainnya
formData.append('paymentProof', fileInput.files[0]); // File object

fetch('/api/member/class-registrations', {
  method: 'POST',
  body: formData,
  headers: {
    // Jangan set Content-Type, browser akan set otomatis
  }
});
```

**Contoh Request (JSON - backward compatible):**
```javascript
fetch('/api/member/class-registrations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    programId: 'barista-basic',
    programName: 'Barista Basic Training',
    fullName: 'John Doe',
    // ... field lainnya
    paymentProof: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' // Base64 string
  })
});
```

#### PUT `/api/member/class-registrations/[id]` ([id]/route.ts](src/app/api/member/class-registrations/[id]/route.ts))

**Perubahan:**
- Support 2 content type seperti POST
- Upload file baru dan update URL di database

#### GET `/api/payment-proof/[id]` ([payment-proof/[id]/route.ts](src/app/api/payment-proof/[id]/route.ts))

**Perubahan:**
- Baca file dari file system (bukan dari database)
- Detect content type dari ekstensi file
- Stream file ke response

### 4. Folder Structure

```
public/
  uploads/
    proofs/           # Folder untuk payment proof
      payment-proof-{timestamp}-{random}.jpg
      payment-proof-{timestamp}-{random}.png
```

## Migration Database

Migration telah dibuat dan dijalankan:

```bash
npx prisma migrate dev --name change_payment_proof_to_string
```

**Catatan Penting:**
- Data BLOB yang sudah ada di database **tidak** otomatis di-migrate ke file system
- Untuk migrasi data lama, perlu script terpisah yang:
  1. Baca BLOB dari database
  2. Simpan ke file system
  3. Update kolom paymentProof dengan URL file

## Testing

### Test Upload via Multipart Form Data

```javascript
// Client-side code
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const response = await fetch('/api/member/class-registrations', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log(result);
};
```

### Test Upload via Base64 (Backward Compatible)

```javascript
// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const file = e.target.paymentProof.files[0];
  const base64 = await fileToBase64(file);
  
  const response = await fetch('/api/member/class-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // ... data lainnya
      paymentProof: base64
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

## Rollback (Jika Diperlukan)

Jika perlu rollback:

1. Revert schema.prisma ke versi sebelumnya
2. Jalankan migration:
   ```bash
   npx prisma migrate dev --name revert_payment_proof_to_bytes
   ```
3. Revert perubahan di API routes

## Keamanan

- File upload dibatasi hanya untuk image (JPEG, PNG, WebP)
- Maximum file size: 5MB
- Nama file di-generate secara random untuk mencegah collision
- Authorization check: member hanya bisa akses payment proof milik sendiri, admin bisa akses semua

## Performance

**Sebelum (BLOB):**
- Query SELECT mengambil binary data → slow
- Database size membengkak
- Sulit di-cache

**Sesudah (File System):**
- Query SELECT hanya mengambil URL → fast
- Database size lebih kecil
- File bisa di-cache dengan mudah
- Bisa di-serve langsung oleh Nginx/CDN di production

## TODO untuk Production

1. **CDN Integration**: Upload file ke CDN (e.g., Cloudinary, AWS S3)
2. **Image Optimization**: Compress dan resize image sebelum simpan
3. **Cleanup**: Hapus file orphan (file yang tidak ada di database)
4. **Backup**: Setup backup untuk folder uploads
5. **Migration Script**: Migrasi data BLOB lama ke file system

## Files Modified

- [prisma/schema.prisma](prisma/schema.prisma) - Schema definition
- [src/lib/upload-utils.ts](src/lib/upload-utils.ts) - NEW: Upload utility functions
- [src/app/api/member/class-registrations/route.ts](src/app/api/member/class-registrations/route.ts) - POST endpoint
- [src/app/api/member/class-registrations/[id]/route.ts](src/app/api/member/class-registrations/[id]/route.ts) - PUT endpoint
- [src/app/api/payment-proof/[id]/route.ts](src/app/api/payment-proof/[id]/route.ts) - GET endpoint

## Support

Jika ada masalah atau pertanyaan:
1. Check logs di console untuk error details
2. Pastikan folder `public/uploads/proofs` ada dan writable
3. Pastikan DATABASE_URL di .env sudah benar
4. Jalankan `npx prisma generate` jika ada error Prisma Client
