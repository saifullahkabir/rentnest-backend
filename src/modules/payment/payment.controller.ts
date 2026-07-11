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

//* webhook
const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    await paymentService.confirmPayment(payload, signature);

    return sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Payment confirmed successfully.",
      data: null,
    });
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;

    const result = await paymentService.getMyPayments(tenantId);

    return sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Payments retrieved successfully.",
      data: result,
    });
  },
);

const getLandlordPayments = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id as string;

  const result = await paymentService.getLandlordPayments(landlordId);

  return sendResponse(res, {
    success: true,
    statusCode: HttpStatus.OK,
    message: "Payments retrieved successfully.",
    data: result,
  });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getLandlordPayments,
};
