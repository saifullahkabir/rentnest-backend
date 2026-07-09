import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: Number(process.env.PORT) || 5000,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  node_env: process.env.NODE_ENV,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS),

  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env
    .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  jwt_refresh_expires_in: process.env
    .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};
