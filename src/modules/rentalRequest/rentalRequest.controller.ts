import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalRequestService } from "./rentalRequest.service";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const payload = req.body;

    const result = await rentalRequestService.createRentalRequest(
      tenantId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Rental request created successfully.",
      data: result,
    });
  },
);

const getMyRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const result = await rentalRequestService.getMyRequests(tenantId);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Rental requests retrieved successfully.",
      data: result,
    });
  },
);

export const rentalRequestController = {
  createRentalRequest,
  getMyRequests
};
