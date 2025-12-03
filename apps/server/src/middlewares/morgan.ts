import morgan, { StreamOptions } from "morgan";
import logger from "../logger";

const stream: StreamOptions = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

const morganMiddleware = morgan("combined", { stream });

export default morganMiddleware;
