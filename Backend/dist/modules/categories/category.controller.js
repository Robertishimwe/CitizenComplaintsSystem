"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const catchAsync_1 = __importDefault(require("@/utils/catchAsync"));
const ApiError_1 = require("@/utils/ApiError");
class CategoryController {
    constructor() {
        this.createCategory = (0, catchAsync_1.default)(async (req, res) => {
            const dto = req.validatedBody;
            const newCategory = await this.categoryService.createCategory(dto);
            res.status(201).json({
                status: 'success',
                message: 'Category created successfully.',
                data: newCategory,
            });
        });
        this.getCategoryById = (0, catchAsync_1.default)(async (req, res) => {
            const { categoryId } = req.validatedParams;
            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                throw new ApiError_1.ApiError(404, 'Category not found');
            }
            res.status(200).json({
                status: 'success',
                data: category,
            });
        });
        this.listCategories = (0, catchAsync_1.default)(async (req, res) => {
            const query = req.validatedQuery;
            const result = await this.categoryService.listCategories(query);
            // Check if result is PaginatedCategoriesResponse or array (tree)
            if (Array.isArray(result)) { // Tree view
                res.status(200).json({
                    status: 'success',
                    data: result,
                });
            }
            else { // Paginated list
                res.status(200).json({
                    status: 'success',
                    data: result.categories,
                    meta: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                });
            }
        });
        this.updateCategory = (0, catchAsync_1.default)(async (req, res) => {
            const { categoryId } = req.validatedParams;
            const dto = req.validatedBody;
            const updatedCategory = await this.categoryService.updateCategory(categoryId, dto);
            if (!updatedCategory) {
                throw new ApiError_1.ApiError(404, 'Category not found or no changes applied.');
            }
            res.status(200).json({
                status: 'success',
                message: 'Category updated successfully.',
                data: updatedCategory,
            });
        });
        this.deleteCategory = (0, catchAsync_1.default)(async (req, res) => {
            const { categoryId } = req.validatedParams;
            const result = await this.categoryService.deleteCategory(categoryId);
            // Service throws 404 if not found, so result should exist if no error
            res.status(200).json({
                status: 'success',
                message: result?.message || 'Category deleted successfully.',
                // data: { id: categoryId } // Optionally return the ID
            });
        });
        this.getCategoryTree = (0, catchAsync_1.default)(async (req, res) => {
            const tree = await this.categoryService.getCategoryTree();
            res.status(200).json({
                status: 'success',
                data: tree,
            });
        });
        this.categoryService = new category_service_1.CategoryService();
    }
}
exports.CategoryController = CategoryController;
