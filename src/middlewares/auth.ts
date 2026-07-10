import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";

export const auth = (...roles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource.",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    const { id, email, role } = verifiedToken;

    if (roles.length && !roles.includes(role)) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        "User not found. Please login again.",
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Your account has been blocked. Please contact support.",
      );
    }

    req.user = { id, email, role };

    next();
  });
};
