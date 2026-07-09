import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TResponseData<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: TMeta;
};

export const sendResponse = <T>(
  res: Response,
  responseData: TResponseData<T>,
) => {
  return res.status(responseData.statusCode).json(responseData);
};
