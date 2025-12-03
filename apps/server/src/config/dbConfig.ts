import mongoose from "mongoose";
import logger from "../logger";
import env from "./env";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URL!);
    logger.info("MongoDB connected (dev mode)");
  } catch (err: any) {
    logger.error("DB connection failed", err.message);
    process.exit(1);
  }
};

export default connectDB;
