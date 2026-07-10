import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";

const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const landlordId = req.user?.id as string;

    const result = await propertyService.createProperty(payload, landlordId);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Property created successfully.",
      data: result,
    });
  },
);

const getMyProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.getMyProperties(
      req.user?.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Properties retrieved successfully.",
      data: result,
    });
  },
);

export const propertyController = {
  createProperty,
  getMyProperties
};
