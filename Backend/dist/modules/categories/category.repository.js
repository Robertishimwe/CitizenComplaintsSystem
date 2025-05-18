"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
// src/modules/categories/category.repository.ts
const prisma_1 = __importDefault(require("@/config/prisma"));
class CategoryRepository {
    async create(data) {
        return prisma_1.default.category.create({
            data: {
                name: data.name,
                description: data.description,
                parentCategoryId: data.parentCategoryId,
            },
            include: {
                parentCategory: { select: { id: true, name: true } },
                subCategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
            },
        });
    }
    async findById(id) {
        return prisma_1.default.category.findUnique({
            where: { id },
            include: {
                parentCategory: { select: { id: true, name: true } },
                subCategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
            },
        });
    }
    async findByName(name, parentCategoryId = null) {
        // For simplicity, assuming globally unique names.
        // If unique within parent: where: { name, parentCategoryId }
        return prisma_1.default.category.findUnique({
            where: { name },
        });
    }
    async findAll(filters, pagination, sorting) {
        const where = {};
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.isRoot !== undefined) {
            where.parentCategoryId = filters.isRoot ? null : { not: null };
        }
        const categories = await prisma_1.default.category.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [sorting.sortBy]: sorting.sortOrder,
            },
            include: {
                parentCategory: { select: { id: true, name: true } },
            },
        });
        const total = await prisma_1.default.category.count({ where });
        return { categories, total };
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.parentCategoryId === null) {
            updateData.parentCategory = { disconnect: true };
        }
        else if (data.parentCategoryId !== undefined) {
            updateData.parentCategory = { connect: { id: data.parentCategoryId } };
        }
        if (Object.keys(updateData).length === 0) {
            return this.findById(id); // This will return CategoryWithDetails | null
        }
        return prisma_1.default.category.update({
            where: { id },
            data: updateData,
            include: {
                parentCategory: { select: { id: true, name: true } },
                subCategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
            },
        });
    }
    async delete(id) {
        const categoryWithDetails = await this.findById(id); // categoryWithDetails is now correctly typed as CategoryWithDetails | null
        if (!categoryWithDetails)
            return null;
        // Now categoryWithDetails.subCategories is known to TypeScript
        if (categoryWithDetails.subCategories && categoryWithDetails.subCategories.length > 0) {
            console.warn(`Deleting category "${categoryWithDetails.name}" which has ${categoryWithDetails.subCategories.length} sub-categories. Their parent will be set to null due to schema's onDelete behavior.`);
        }
        return prisma_1.default.category.delete({
            where: { id },
        });
    }
    async getCategoryTree(parentId = null) {
        const categories = await prisma_1.default.category.findMany({
            where: { parentCategoryId: parentId },
            select: {
                id: true,
                name: true,
                description: true,
            },
            orderBy: { name: 'asc' },
        });
        const tree = [];
        for (const category of categories) {
            const children = await this.getCategoryTree(category.id);
            tree.push({
                ...category,
                children: children.length > 0 ? children : undefined,
            });
        }
        return tree;
    }
}
exports.CategoryRepository = CategoryRepository;
// // src/modules/categories/category.repository.ts
// import prisma from '@/config/prisma';
// import { Prisma, Category } from '@prisma/client';
// import { CreateCategoryPayload, UpdateCategoryPayload, CategoryFilter } from './interfaces/category.interfaces';
// export class CategoryRepository {
//   async create(data: CreateCategoryPayload): Promise<Category> {
//     return prisma.category.create({
//       data: {
//         name: data.name,
//         description: data.description,
//         parentCategoryId: data.parentCategoryId, // Can be null
//       },
//       include: { parentCategory: { select: { id: true, name: true } } },
//     });
//   }
//   async findById(id: string): Promise<Category | null> {
//     return prisma.category.findUnique({
//       where: { id },
//       include: {
//         parentCategory: { select: { id: true, name: true } },
//         subCategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } }, // Include subcategories
//       },
//     });
//   }
//   async findByName(name: string, parentCategoryId: string | null = null): Promise<Category | null> {
//     // Category names should be unique, or unique within a parent
//     // For simplicity, let's assume globally unique names for now.
//     // If unique within parent: where: { name, parentCategoryId }
//     return prisma.category.findUnique({
//       where: { name }, // Assuming globally unique names
//     });
//   }
//   async findAll(
//     filters: CategoryFilter,
//     pagination: { skip: number; take: number },
//     sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
//   ): Promise<{ categories: Category[]; total: number }> {
//     const where: Prisma.CategoryWhereInput = {};
//     if (filters.search) {
//       where.OR = [
//         { name: { contains: filters.search, mode: 'insensitive' } },
//         { description: { contains: filters.search, mode: 'insensitive' } },
//       ];
//     }
//     if (filters.isRoot !== undefined) {
//       where.parentCategoryId = filters.isRoot ? null : { not: null };
//     }
//     const categories = await prisma.category.findMany({
//       where,
//       skip: pagination.skip,
//       take: pagination.take,
//       orderBy: {
//         [sorting.sortBy]: sorting.sortOrder,
//       },
//       include: { // Include parent and subcategories for context in lists
//         parentCategory: { select: { id: true, name: true } },
//         // Optionally, limit depth or count of subCategories here for performance in lists
//         // subCategories: { select: { id: true, name: true }, take: 5, orderBy: { name: 'asc' } },
//       },
//     });
//     const total = await prisma.category.count({ where });
//     return { categories, total };
//   }
//   async update(id: string, data: UpdateCategoryPayload): Promise<Category | null> {
//     const updateData: Prisma.CategoryUpdateInput = {};
//     if (data.name !== undefined) updateData.name = data.name;
//     if (data.description !== undefined) updateData.description = data.description;
//     // Handle parentCategoryId update: connect, disconnect, or set to null
//     if (data.parentCategoryId === null) { // Explicitly set to no parent
//       updateData.parentCategory = { disconnect: true };
//     } else if (data.parentCategoryId !== undefined) { // Set to a new parent
//       updateData.parentCategory = { connect: { id: data.parentCategoryId } };
//     }
//     // If data.parentCategoryId is undefined, the parent relationship is not changed by this update.
//     if (Object.keys(updateData).length === 0) {
//         return this.findById(id);
//     }
//     return prisma.category.update({
//       where: { id },
//       data: updateData,
//       include: {
//         parentCategory: { select: { id: true, name: true } },
//         subCategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
//       },
//     });
//   }
//   async delete(id: string): Promise<Category | null> {
//     // What happens on delete?
//     // 1. Subcategories: Prisma's onDelete for self-relation (parentCategoryId) is SetNull. So subcategories become root.
//     // 2. RoutingRules: If Category is deleted, RoutingRule is deleted (onDelete: Cascade).
//     // 3. Tickets: If Category is deleted, ticket.categoryId becomes null (onDelete: SetNull).
//     // Consider if this is the desired behavior. "Deactivating" might be safer if categories are widely used.
//     // For now, implementing hard delete as per typical category management.
//     // Ensure you have a backup or soft delete strategy if data loss is a concern.
//     const category = await this.findById(id);
//     if (!category) return null;
//     // Before deleting, check if it has subcategories. Prevent deletion if it does? Or re-parent them?
//     // For simplicity now, allowing delete. Prisma handles subcategory parent links.
//     if (category.subCategories && category.subCategories.length > 0) {
//         // throw new ApiError(400, 'Cannot delete category with sub-categories. Please re-assign or delete sub-categories first.');
//         // Or, automatically make sub-categories root (Prisma does this with SetNull)
//     }
//     return prisma.category.delete({
//       where: { id },
//     });
//   }
//   // Helper to fetch categories as a tree (recursive)
//   // This can be complex and performance-intensive if not careful
//   async getCategoryTree(parentId: string | null = null): Promise<any[]> {
//     const categories = await prisma.category.findMany({
//       where: { parentCategoryId: parentId },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         // _count: { select: { subCategories: true } } // To know if it has children without fetching all
//       },
//       orderBy: { name: 'asc' },
//     });
//     const tree = [];
//     for (const category of categories) {
//       const children = await this.getCategoryTree(category.id);
//       tree.push({
//         ...category,
//         children: children.length > 0 ? children : undefined, // only add children array if non-empty
//       });
//     }
//     return tree;
//   }
// }
