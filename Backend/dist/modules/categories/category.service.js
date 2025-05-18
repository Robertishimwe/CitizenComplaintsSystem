"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
// src/modules/categories/category.service.ts
const category_repository_1 = require("./category.repository");
const ApiError_1 = require("@/utils/ApiError");
// Assuming CategoryTreeNode is defined in category.repository.ts or a shared interface
// If not, you might need to define or import it here too if service needs to know its exact structure.
// For now, the repository returns any[] for tree, and controller might just pass it through.
// Let's refine the return type for the service's getCategoryTree.
// We can use the CategoryTreeNode from the repository if it's exported, or define a similar one.
// For simplicity here, let's assume the repository's type is sufficient for now.
// Or, if category.repository.ts exports CategoryTreeNode:
// import { CategoryTreeNode } from './category.repository';
class CategoryService {
    constructor() {
        this.categoryRepository = new category_repository_1.CategoryRepository();
    }
    // Helper to map Prisma's Category (potentially with relations) to CategoryResponse
    // This needs to be flexible as different repository methods might include different relations.
    mapToCategoryResponse(category) {
        if (!category)
            return category;
        // Create a base response object excluding parentCategoryId if parentCategory object exists
        const { parentCategoryId, ...restOfCategoryData } = category;
        const response = {
            ...restOfCategoryData, // Spread all other properties from category
            // Explicitly map known relations if they exist on the input 'category' object
            parentCategory: category.parentCategory ? { id: category.parentCategory.id, name: category.parentCategory.name } : undefined,
            subCategories: category.subCategories ? category.subCategories.map((sub) => ({ id: sub.id, name: sub.name })) : undefined,
        };
        return response;
    }
    async createCategory(dto) {
        const existingCategory = await this.categoryRepository.findByName(dto.name);
        if (existingCategory) {
            throw new ApiError_1.ApiError(409, `Category with name "${dto.name}" already exists.`);
        }
        if (dto.parentCategoryId) {
            const parentExists = await this.categoryRepository.findById(dto.parentCategoryId);
            if (!parentExists) {
                throw new ApiError_1.ApiError(404, `Parent category with ID "${dto.parentCategoryId}" not found.`);
            }
        }
        const payload = { ...dto };
        const newCategory = await this.categoryRepository.create(payload);
        return this.mapToCategoryResponse(newCategory);
    }
    async getCategoryById(id) {
        const category = await this.categoryRepository.findById(id);
        return category ? this.mapToCategoryResponse(category) : null;
    }
    async listCategories(query) {
        // The tree view logic was removed from here, handled by a dedicated getCategoryTree method/endpoint
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {
            search: query.search,
            isRoot: query.isRoot,
        };
        const sorting = {
            sortBy: query.sortBy || 'name',
            sortOrder: query.sortOrder || 'asc',
        };
        const { categories, total } = await this.categoryRepository.findAll(filters, { skip, take: limit }, sorting);
        return {
            categories: categories.map(cat => this.mapToCategoryResponse(cat)), // Ensure mapping
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateCategory(id, dto) {
        const categoryToUpdate = await this.categoryRepository.findById(id);
        if (!categoryToUpdate) {
            throw new ApiError_1.ApiError(404, 'Category not found.');
        }
        if (dto.name && dto.name !== categoryToUpdate.name) {
            const existingNameCategory = await this.categoryRepository.findByName(dto.name);
            if (existingNameCategory && existingNameCategory.id !== id) {
                throw new ApiError_1.ApiError(409, `Another category with name "${dto.name}" already exists.`);
            }
        }
        if (dto.parentCategoryId) {
            if (dto.parentCategoryId === id) {
                throw new ApiError_1.ApiError(400, 'Category cannot be its own parent.');
            }
            const parentExists = await this.categoryRepository.findById(dto.parentCategoryId);
            if (!parentExists) {
                throw new ApiError_1.ApiError(404, `Parent category with ID "${dto.parentCategoryId}" not found.`);
            }
        }
        const payload = { ...dto };
        const updatedCategory = await this.categoryRepository.update(id, payload);
        return updatedCategory ? this.mapToCategoryResponse(updatedCategory) : null;
    }
    async deleteCategory(id) {
        const category = await this.categoryRepository.findById(id); // Check existence first
        if (!category) {
            throw new ApiError_1.ApiError(404, 'Category not found.');
        }
        const deletedCategory = await this.categoryRepository.delete(id); // Repository handles actual deletion
        if (!deletedCategory) {
            // This case should ideally not be hit if the above check passed and delete didn't throw an unhandled error
            throw new ApiError_1.ApiError(500, 'Failed to delete category.');
        }
        return { id: deletedCategory.id, message: 'Category deleted successfully.' };
    }
    // Add the missing getCategoryTree method
    async getCategoryTree() {
        return this.categoryRepository.getCategoryTree();
    }
}
exports.CategoryService = CategoryService;
