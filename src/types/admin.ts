/**
 * Shared types untuk Admin Dashboard
 * Definisi interface untuk data models yang digunakan di seluruh admin pages
 */

// ============= Product Types =============

/**
 * Interface untuk Product entity
 */
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Form data untuk create/update product
 */
export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
}

// ============= News Types =============

/**
 * Interface untuk News entity
 */
export interface News {
  id: number;
  title: string;
  category: string;
  content: string;
  excerpt?: string;
  image: string;
  author: string;
  publishDate: Date;
  status: string;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Form data untuk create/update news
 */
export interface NewsFormData {
  title: string;
  category: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  publishDate: string;
  status: string;
}

// ============= Message Types =============

/**
 * Interface untuk Message entity
 */
export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  reply?: string;
  replyDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============= Class Types =============

/**
 * Interface untuk Class entity
 */
export interface Class {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: Date;
  price: number;
  maxParticipants: number;
  enrolledCount: number;
  status: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Form data untuk create/update class
 */
export interface ClassFormData {
  title: string;
  description: string;
  instructor: string;
  schedule: string;
  price: number;
  maxParticipants: number;
  image: string;
}

// ============= Enrollment Types =============

/**
 * Interface untuk Enrollment entity
 */
export interface Enrollment {
  id: number;
  classId: number;
  class?: Class;
  studentName: string;
  email: string;
  phone: string;
  certificateUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============= Modal Types =============

/**
 * Modal modes untuk CRUD operations
 */
export type ModalMode = "add" | "edit" | "detail";

// ============= Common Filter Types =============

/**
 * Status filter options
 */
export type StatusFilter = "all" | "active" | "inactive" | "published" | "draft";

/**
 * Category filter options untuk products
 */
export type ProductCategory = "all" | "kopi" | "makanan" | "merchandise";
