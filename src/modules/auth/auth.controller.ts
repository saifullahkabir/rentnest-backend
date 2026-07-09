import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";
import config from "../../config";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: config.node_env === "production" ? "none" : "lax",
    secure: config.node_env === "production",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: config.node_env === "production" ? "none" : "lax",
    secure: config.node_env === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
  });

  sendResponse(res, {
    success: true,
    statusCode: HttpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
});

export const authController = {
  registerUser,
  loginUser,
};
