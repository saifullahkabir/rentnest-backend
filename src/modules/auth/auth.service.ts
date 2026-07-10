import HttpStatus from "http-status";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import config from "../../config";
import AppError from "../../utils/AppError";
import { IJwtPayload, jwtUtils } from "../../utils/jwt";

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

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

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

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(HttpStatus.FORBIDDEN, "Your account has been blocked.");
  }

  const jwtPayload: IJwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  const { id } = verifiedRefreshToken;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(HttpStatus.FORBIDDEN, "Your account has been blocked.");
  }

  const jwtPayload: IJwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return accessToken;
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUser,
  refreshToken,
  getMe,
};
