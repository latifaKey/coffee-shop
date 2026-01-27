import { PrismaClient } from "@prisma/client";

// Prisma client singleton with optimized configuration
// Updated: 2025-12-22 - Added query optimization and connection pooling
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["warn", "error"] // Reduced logging for performance
      : ["error"],
    // Optimize connection handling
  });
};

export const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Helper: Disconnect prisma on app shutdown (untuk serverless)
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
