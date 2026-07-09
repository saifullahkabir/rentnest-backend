import HttpStatus from "http-status";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ILoginUser, IRegisterUser } from "./auth.interface";
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

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, "User not found.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(HttpStatus.FORBIDDEN, "Your account has been banned.");
  }

  const jwtPayload = {
    id: user.id,
    email: user.name,
    role: user.role,
  };

  
};

export const authService = {
  registerUserIntoDB,
  loginUser,
};
