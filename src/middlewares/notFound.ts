import HttpStatus from "http-status";
import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  return res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    statusCode: HttpStatus.NOT_FOUND,
    message: "Route not found",
    path: req.originalUrl,
  });
};
