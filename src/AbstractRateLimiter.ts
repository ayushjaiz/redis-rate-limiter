import { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis';

abstract class AbstractRateLimiter {
  protected redisClient: Redis;

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  protected abstract validate(key: string): Promise<boolean>;
  abstract middleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export default AbstractRateLimiter;
