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

export const categoryController = {
  createCategory,
  getAllCategories
};
