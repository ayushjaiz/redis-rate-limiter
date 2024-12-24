import { NextFunction, Request, Response } from "express";
import { Redis } from "ioredis";
import { RateLimiterOptions } from "..";
import { generateRateLimiterKey } from "../utils/getKey";

abstract class AbstractRateLimiter {
  protected redisClient: Redis;
  protected windowInSeconds: number;
  protected maxRequests: number;

  constructor(options: RateLimiterOptions) {
    this.redisClient = options.redisClient;
    this.windowInSeconds = options.windowInSeconds;
    this.maxRequests = options.maxRequests;
  }

  protected abstract validate(key: string): Promise<boolean>;

  middleware(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = generateRateLimiterKey(req);
        const isAllowed = await this.validate(key);

        if (isAllowed) {
          next();
        } else {
          res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        }
      } catch (err) {
        console.error("Rate limiter middleware error:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    };
  }
}

export default AbstractRateLimiter;
