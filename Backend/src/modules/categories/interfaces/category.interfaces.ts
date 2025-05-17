// src/modules/categories/interfaces/category.interfaces.ts
import { Category as PrismaCategory } from '@prisma/client';

// For API responses, include subCategories and parentCategory if fetched
export interface CategoryResponse extends Omit<PrismaCategory, 'parentCategoryId'> {
  parentCategory?: { id: string; name: string } | null;
  subCategories?: { id: string; name: string }[]; // Array of simplified sub-category info
  // Add path or breadcrumbs if needed for deeply nested categories
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentCategoryId?: string | null; // Null to explicitly set no parent
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  parentCategoryId?: string | null;
}

export interface CategoryFilter {
  search?: string; // For searching by name or description
  isRoot?: boolean; // To fetch only root categories (no parent)
}

export interface PaginatedCategoriesResponse {
  categories: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
