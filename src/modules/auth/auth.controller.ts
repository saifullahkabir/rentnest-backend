import { Request, Response } from "express";

const registerUser = (req: Request, res: Response) => {
    console.log(req.body);
};

export const authController = {
  registerUser,
};
