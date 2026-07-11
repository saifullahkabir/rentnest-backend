import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Users retrieved successfully.",
      data: result,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id as string;
    const adminId = req.user?.id as string;

    const result = await adminService.updateUserStatus(
      userId,
      adminId,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "User status updated successfully.",
      data: result,
    });
  },
);

const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllRentalRequests();

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Rental requests retrieved successfully.",
      data: result,
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllRentalRequests,
};
