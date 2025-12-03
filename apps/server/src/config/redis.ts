// src/config/redis.ts
import Redis from "ioredis";
import logger from "../logger";
import env from "./env";

const REDIS_URL = env.REDIS_URL || "redis://127.0.0.1:6379";

const redisClient = new Redis(REDIS_URL, {
  // Optional: Upstash TLS support in one line
  tls: REDIS_URL.includes("upstash")
    ? { rejectUnauthorized: false }
    : undefined,

  // will auto reconnect
  retryStrategy(times) {
    return Math.min(times * 200, 2000); // retry every 0.2s -> 2s
  },
});

redisClient.on("connect", () => logger.info("[Redis] connected"));
redisClient.on("ready", () => logger.info("[Redis] ready"));
redisClient.on("error", (err) => logger.warn("[Redis] error:", err.message));
redisClient.on("close", () => logger.warn("[Redis] connection closed"));

export default redisClient;
