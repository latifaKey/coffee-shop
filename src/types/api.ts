/**
 * Type definitions untuk API routes
 * Membantu type safety dan menghindari penggunaan 'any'
 */

import { Prisma } from "@prisma/client";

// ============= Where Clause Types =============

/**
 * Type untuk where clause News query
 */
export interface NewsWhereInput {
  category?: string;
  status?: string;
}

/**
 * Type untuk where clause Message query
 */
export interface MessageWhereInput {
  isRead?: boolean;
  reply?: {
    not: null;
  } | null;
}

/**
 * Type untuk where clause Class query
 */
export interface ClassWhereInput {
  status?: string;
}

/**
 * Type untuk where clause Enrollment query
 */
export interface EnrollmentWhereInput {
  classId?: number;
}

// ============= Update Data Types =============

/**
 * Type untuk update message data
 */
export interface MessageUpdateInput {
  isRead?: boolean;
  reply?: string;
  replyDate?: Date;
}

/**
 * Type untuk update class data
 */
export interface ClassUpdateInput {
  title?: string;
  description?: string;
  instructor?: string;
  schedule?: Date;
  price?: number;
  maxParticipants?: number;
  enrolledCount?: number;
  status?: string;
  image?: string;
}

// ============= Prisma Type Exports =============

/**
 * Re-export Prisma types untuk consistent usage
 * Note: Prisma generates lowercase type names based on model names
 */
export type PrismaNewsWhereInput = Prisma.newsWhereInput;
export type PrismaMessageWhereInput = Prisma.messageWhereInput;
export type PrismaClassWhereInput = Prisma.RenamedclassWhereInput;
export type PrismaEnrollmentWhereInput = Prisma.classregistrationWhereInput;
