import { PrismaClient } from "@prisma/client";

// Prisma client singleton with optimized configuration
// Updated: 2025-12-22 - Added query optimization and connection pooling
// Updated: 2026-02-04 - Fixed for Vercel build (lazy initialization)

 
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["warn", "error"]
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper: Disconnect prisma on app shutdown (untuk serverless)
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
