import dotenv from "dotenv";
dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URL: process.env.MONGODB_URL,
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL,
  FROM_NAME: process.env.FROM_NAME,

  //jwt
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

  // ACCESS_TOKEN_MAX_AGE: process.env.ACCESS_TOKEN_MAX_AGE,
  // REFRESH_TOKEN_MAX_AGE: process.env.REFRESH_TOKEN_MAX_AGE,

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
};

export default env;
