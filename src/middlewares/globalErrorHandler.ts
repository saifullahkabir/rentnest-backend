import HttpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import AppError from "../utils/AppError";

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = (err as Error).message || "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = HttpStatus.BAD_REQUEST;
    errorMessage =
      "Invalid request data. Please check the provided fields and their values.";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = HttpStatus.CONFLICT;
      errorMessage = "The provided value already exists.";
    } else if (err.code === "P2003") {
      statusCode = HttpStatus.BAD_REQUEST;
      errorMessage = "The requested resource is related to another record.";
    } else if (err.code === "P2025") {
      statusCode = HttpStatus.NOT_FOUND;
      errorMessage = "Record not found.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = HttpStatus.UNAUTHORIZED;
      errorMessage = "Authentication failed. Please check your credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = "Can't reach database server.";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution.";
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: errorMessage,
    errorDetails:
      config.node_env === "development"
        ? {
            name: (err as Error).name,
            stack: (err as Error).stack,
          }
        : undefined,
  });
};
