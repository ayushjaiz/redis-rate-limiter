import { Redis } from 'ioredis';
import FixedWindowLimiter from './rate-limiter/FixedWindowLimiter';
import AbstractRateLimiter from './rate-limiter/AbstractRateLimiter';

export enum RateLimiterType {
    FixedWindow = 'FIXED_WINDOW',
    SlidingWindow = 'SLIDING_WINDOW',
}

export interface RateLimiterOptions {
    windowInSeconds: number;
    maxRequests: number;
    redisClient: Redis;
}

export interface RateLimiterOptionsWithTypes extends RateLimiterOptions {
    type: RateLimiterType;
}

export default class RateLimiter {
    private limiter: AbstractRateLimiter;

    constructor(options: RateLimiterOptionsWithTypes) {
        const { redisClient, windowInSeconds, maxRequests, type } = options;

        switch (type) {
            case RateLimiterType.FixedWindow:
                this.limiter = new FixedWindowLimiter({ redisClient, windowInSeconds, maxRequests });
                break;

            // case RateLimiterType.SlidingWindow:
            //     this.limiter = new SlidingWindowLimiter(redisClient, windowInSeconds, limit);
            //     break;
            default:
                throw new Error(`Unsupported rate limiter type: ${type}. Supported types are: ${Object.values(RateLimiterType).join(', ')}`);
        }
    }

    /**
     * Returns the middleware function of the selected limiter.
     */
    middleware() {
        return this.limiter.middleware();
    }
}
