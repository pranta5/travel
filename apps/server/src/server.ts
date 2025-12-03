import app from "./app";
import connectDB from "./config/dbConfig";
import env from "./config/env";
import logger from "./logger";
const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB(); // Connect to DB
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (${env.NODE_ENV})`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
