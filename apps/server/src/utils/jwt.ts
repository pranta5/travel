import jwt, { JwtPayload } from "jsonwebtoken";
import redis from "../config/redis"; // ← Use your ioredis instance
import logger from "../logger";
import env from "../config/env";

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  logger.error("JWT secrets are missing in environment variables");
  process.exit(1);
}

const ACCESS_TOKEN_EXPIRES = env.ACCESS_TOKEN_MAX_AGE;
const REFRESH_TOKEN_EXPIRES = env.REFRESH_TOKEN_MAX_AGE;

export interface TokenPayload extends JwtPayload {
  userId: string;
  name: string;
  role: string;
  email?: string;
}

// Generate Access Token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    { userId: payload.userId, role: payload.role, email: payload.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
};

// Generate & Store Refresh Token
export const generateRefreshToken = async (
  payload: TokenPayload
): Promise<string> => {
  const refreshToken = jwt.sign(
    { userId: payload.userId, role: payload.role, email: payload.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  if (!redis) {
    logger.warn(
      "Redis not available – refresh token not stored (dev mode only)"
    );
    return refreshToken;
  }

  try {
    await redis.set(
      `refresh:${payload.userId}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );
  } catch (err) {
    logger.error("Failed to store refresh token in Redis", err);
    // Don't block login if Redis is down (optional – you can throw here if strict)
  }

  return refreshToken;
};

// Verify Access Token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }
    throw new Error("Token verification failed");
  }
};

// Verify Refresh Token (with blacklist check)
export const verifyRefreshToken = async (
  token: string
): Promise<TokenPayload> => {
  let decoded: TokenPayload;
  //   console.log("token", token);

  try {
    decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError")
      throw new Error("Refresh token expired");
    if (err.name === "JsonWebTokenError")
      throw new Error("Invalid refresh token");
    throw new Error("Token verification failed");
  }

  if (!redis) {
    logger.warn("Redis not available – skipping refresh token validation");
    return decoded;
  }

  const storedToken = await redis.get(`refresh:${decoded.userId}`);

  if (storedToken !== token) {
    throw new Error("Refresh token revoked or invalid");
  }

  return decoded;
};

// Rotate Tokens (used in /refresh endpoint)
export const rotateTokens = async (oldRefreshToken: string) => {
  const decoded = await verifyRefreshToken(oldRefreshToken);

  const newAccessToken = generateAccessToken(decoded);
  const newRefreshToken = await generateRefreshToken(decoded);

  // Optional: invalidate old refresh token immediately (security)
  if (redis) {
    await redis.del(`refresh:${decoded.userId}`);
    await redis.set(
      `refresh:${decoded.userId}`,
      newRefreshToken,
      "EX",
      7 * 24 * 60 * 60
    );
  }

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// Logout – Blacklist refresh token
export const invalidateRefreshToken = async (userId: string): Promise<void> => {
  if (redis) {
    await redis.del(`refresh:${userId}`);
  }
};
