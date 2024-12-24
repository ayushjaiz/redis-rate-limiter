import { Request, Response, NextFunction } from "express";
import AbstractRateLimiter from "./AbstractRateLimiter";
import { getClientIp } from "./utils/getClientIp";

export class FixedWindowLimiter extends AbstractRateLimiter {
    private windowInSeconds: number;
    private maxRequests: number;

    constructor(redisClient: any, windowInSeconds: number, maxRequests: number) {
        super(redisClient);
        this.windowInSeconds = windowInSeconds;
        this.maxRequests = maxRequests;
    }

    async validate(key: string): Promise<boolean> {
        const requestCount = await this.redisClient.incr(key);

        let ttl: number;
        if (requestCount === 1) {
            await this.redisClient.expire(key, this.windowInSeconds);
            ttl = this.windowInSeconds;
        } else {
            ttl = await this.redisClient.ttl(key)
        }

        return requestCount <= this.maxRequests;
    }

    middleware() {
        // Arrow function used to refer this context for validate
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const url = req.url;
                const ip = getClientIp(req);
                const key = `${ip}:${url}`

                console.log(key);

                const isAllowed = await this.validate(key);

                if (isAllowed) {
                    next();
                } else {
                    res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
                }
            } catch (err) {
                console.error('Rate limiter middleware error:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
}