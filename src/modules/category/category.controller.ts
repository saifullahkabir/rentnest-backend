import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.createCategory(req.body);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Category created successfully.",
      data: result,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Categories retrieved successfully.",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id as string;

    const result = await categoryService.updateCategory(categoryId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Category updated successfully.",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id as string;

    const result = await categoryService.deleteCategory(categoryId);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Category deleted successfully.",
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
