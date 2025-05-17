import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, ListCategoriesQueryDto, UpdateCategoryParamsDto } from './dto';
import catchAsync from '@/utils/catchAsync';
import { ApiError } from '@/utils/ApiError';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const dto = req.validatedBody as CreateCategoryDto;
    const newCategory = await this.categoryService.createCategory(dto);
    res.status(201).json({
      status: 'success',
      message: 'Category created successfully.',
      data: newCategory,
    });
  });

  getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.validatedParams as UpdateCategoryParamsDto;
    const category = await this.categoryService.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    res.status(200).json({
      status: 'success',
      data: category,
    });
  });

  listCategories = catchAsync(async (req: Request, res: Response) => {
    const query = req.validatedQuery as ListCategoriesQueryDto;
    const result = await this.categoryService.listCategories(query);
    // Check if result is PaginatedCategoriesResponse or array (tree)
    if (Array.isArray(result)) { // Tree view
        res.status(200).json({
            status: 'success',
            data: result,
        });
    } else { // Paginated list
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

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.validatedParams as UpdateCategoryParamsDto;
    const dto = req.validatedBody as UpdateCategoryDto;
    const updatedCategory = await this.categoryService.updateCategory(categoryId, dto);
    if (!updatedCategory) {
      throw new ApiError(404, 'Category not found or no changes applied.');
    }
    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully.',
      data: updatedCategory,
    });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.validatedParams as UpdateCategoryParamsDto;
    const result = await this.categoryService.deleteCategory(categoryId);
    // Service throws 404 if not found, so result should exist if no error
    res.status(200).json({ // Or 204 No Content if you prefer for deletes that don't return data
      status: 'success',
      message: result?.message || 'Category deleted successfully.',
      // data: { id: categoryId } // Optionally return the ID
    });
  });

  getCategoryTree = catchAsync(async (req: Request, res: Response) => {
    const tree = await this.categoryService.getCategoryTree();
    res.status(200).json({
        status: 'success',
        data: tree,
    });
  });
}
