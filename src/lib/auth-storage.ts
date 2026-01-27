// TypeScript interface untuk User
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // In production, this should be hashed
  role: "admin" | "member";
  createdAt: string;
}

// Temporary in-memory storage (replace with database later)
// In production, use database (Prisma) instead
export const users: User[] = [];
