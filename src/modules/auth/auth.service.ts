import HttpStatus from "http-status";
import bcrypt from "bcryptjs";
import { UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./auth.interface";
import config from "../../config";
import AppError from "../../utils/AppError";

const registerUserIntoDB = async (payload: IRegisterUser) => {
  const { email, password, role } = payload;

  if (role !== UserRole.TENANT && role !== UserRole.LANDLORD) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Role must be TENANT or LANDLORD.",
    );
  }

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(HttpStatus.CONFLICT, "User already exists.");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      phone: payload.phone,
      profileImage: payload.profileImage,
    },
    omit: {
      password: true,
    },
  });

  return result;
};

export const authService = {
  registerUserIntoDB,
};
