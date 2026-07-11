import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;

    const result = await paymentService.createPayment(tenantId, req.body);

    return sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Checkout session created successfully.",
      data: result,
    });
  },
);

export const paymentController = {
  createPayment,
};
