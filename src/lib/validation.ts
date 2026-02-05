import { z } from "zod";

// ============================================
// AUTH SCHEMAS
// ============================================

// Strong password validation regex
const strongPasswordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar (A-Z)")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil (a-z)")
  .regex(/[0-9]/, "Password harus mengandung angka (0-9)");

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: strongPasswordSchema,
  loginType: z.enum(["admin", "member"]).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  password: strongPasswordSchema,
  phone: z.string().min(10, "Nomor telepon tidak valid").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama harus diisi"),
  newPassword: strongPasswordSchema,
});

// ============================================
// PRODUCT SCHEMAS
// ============================================
export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter").max(100),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").optional(),
  price: z.number().positive("Harga harus lebih dari 0"),
  categoryId: z.number().int().positive().nullable(),
  image: z.string().url("URL gambar tidak valid").or(z.string().startsWith("/", "Path gambar tidak valid")),
  isAvailable: z.boolean().default(true),
});

export const updateProductSchema = productSchema.partial();

// ============================================
// CLASS SCHEMAS
// ============================================
export const classSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(100),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  instructor: z.string().min(2, "Nama instruktur minimal 2 karakter"),
  schedule: z.string().datetime("Format tanggal tidak valid").optional().nullable(),
  duration: z.string().regex(/^\d{2}:\d{2}$/, "Format durasi harus HH:MM").default("02:00"),
  totalSessions: z.number().int().min(1, "Minimal 1 sesi").max(20, "Maksimal 20 sesi").default(4),
  location: z.string().min(5, "Lokasi minimal 5 karakter").default("Barizta Coffee Shop"),
  level: z.enum(["Pemula", "Menengah", "Lanjutan"]).default("Pemula"),
  price: z.number().int().positive("Harga harus lebih dari 0"),
  maxParticipants: z.number().int().min(1, "Minimal 1 peserta").max(50, "Maksimal 50 peserta"),
  image: z.string().min(1, "Gambar harus diisi"),
  isActive: z.boolean().default(true),
});

export const updateClassSchema = classSchema.partial();

export const classRegistrationSchema = z.object({
  programId: z.string().min(1, "Program ID harus diisi"),
  programName: z.string().min(1, "Nama program harus diisi"),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  birthDate: z.string().datetime("Format tanggal tidak valid"),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid").max(15),
  email: z.string().email("Format email tidak valid").optional(),
  selectedPackages: z.string().min(1, "Paket harus dipilih"),
  schedulePreference: z.string().min(1, "Preferensi jadwal harus diisi"),
  experience: z.string().min(1, "Pengalaman harus diisi"),
  previousTraining: z.boolean().default(false),
  trainingDetails: z.string().optional(),
});

// ============================================
// NEWS SCHEMAS
// ============================================
export const newsSchema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter").max(200),
  category: z.string().min(2, "Kategori minimal 2 karakter"),
  content: z.string().min(50, "Konten minimal 50 karakter"),
  excerpt: z.string().max(300, "Excerpt maksimal 300 karakter").optional(),
  image: z.string().min(1, "Gambar harus diisi"),
  author: z.string().default("Admin"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateNewsSchema = newsSchema.partial();

// ============================================
// MESSAGE/CONTACT SCHEMAS
// ============================================
export const contactMessageSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  subject: z.string().min(5, "Subjek minimal 5 karakter").max(200),
  message: z.string().min(20, "Pesan minimal 20 karakter"),
});

// ============================================
// PARTNERSHIP SCHEMAS
// ============================================
export const partnershipSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  type: z.string().min(2, "Tipe minimal 2 karakter"),
  contactPerson: z.string().min(2, "Nama kontak minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  startDate: z.string().datetime("Format tanggal tidak valid"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  logo: z.string().min(1, "Logo harus diisi"),
});

export const updatePartnershipSchema = partnershipSchema.partial();

// ============================================
// CATEGORY SCHEMAS
// ============================================
export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(50),
  slug: z.string().min(2, "Slug minimal 2 karakter").max(50).regex(/^[a-z0-9-]+$/, "Slug harus lowercase dan hanya huruf, angka, dan dash"),
  type: z.enum(["MINUMAN", "MAKANAN", "MERCHANDISE"]),
  imageFolder: z.string().optional(),
});

// ============================================
// SCHEDULE SCHEMAS
// ============================================
export const scheduleSchema = z.object({
  date: z.string().datetime("Format tanggal tidak valid"),
  location: z.string().min(5, "Lokasi minimal 5 karakter"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  notes: z.string().optional(),
  coordinator: z.string().min(10, "Nomor WhatsApp tidak valid"),
  mapsUrl: z.string().url("URL maps tidak valid").optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type ClassRegistrationInput = z.infer<typeof classRegistrationSchema>;
export type NewsInput = z.infer<typeof newsSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type PartnershipInput = z.infer<typeof partnershipSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
