import { JwtPayload, SignOptions } from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/enums";
import jwt from "jsonwebtoken";

export interface IJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

const createToken = (
  payload: IJwtPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

const verifyToken = (token: string, secret: string) => {
  const verifiedToken = jwt.verify(token, secret) as IJwtPayload;
  return verifiedToken;
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
