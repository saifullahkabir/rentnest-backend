import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;

    const result = await reviewService.createReview(tenantId, req.body);

    return sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Review created successfully.",
      data: result,
    });
  },
);

const getPropertyReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { propertyId } = req.params;

    const result = await reviewService.getPropertyReviews(propertyId as string);

    return sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Property reviews retrieved successfully.",
      data: result,
    });
  },
);

export const reviewController = {
  createReview,
  getPropertyReviews,
};
