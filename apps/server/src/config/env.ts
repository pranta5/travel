import dotenv from "dotenv";
dotenv.config();
const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URL: process.env.MONGODB_URL,
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL,
  FROM_NAME: process.env.FROM_NAME,

  //jwt
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

  ACCESS_TOKEN_MAX_AGE: Number(process.env.ACCESS_TOKEN_MAX_AGE),
  REFRESH_TOKEN_MAX_AGE: Number(process.env.REFRESH_TOKEN_MAX_AGE),

  //CLOUDINARY
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  //redis
  REDIS_URL: process.env.REDIS_URL,

  //nodemailer
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  APP_BASE_URL: process.env.APP_BASE_URL,
  EMAIL_TOKEN_SECRET: process.env.EMAIL_TOKEN_SECRET,
  EMAIL_TOKEN_EXPIRES: process.env.EMAIL_TOKEN_EXPIRES,

  //socket
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN, // Your frontend URL
  CHAT_RATE_LIMIT_WINDOW_MS: process.env.CHAT_RATE_LIMIT_WINDOW_MS, // 1 min
  CHAT_RATE_LIMIT_MAX: process.env.CHAT_RATE_LIMIT_MAX, // Max messages per window

  //stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
};

export default env;
