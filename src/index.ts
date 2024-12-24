import { Redis } from 'ioredis';
import { FixedWindowLimiter } from './FixedWindowLimiter';
import AbstractRateLimiter from './AbstractRateLimiter';

export enum RateLimiterType {
    FixedWindow = 'FIXED_WINDOW',
    SlidingWindow = 'SLIDING_WINDOW',
}

export interface RateLimiterOptions {
    window: number;
    maxRequests: number;
    redisClient: Redis;
    type: RateLimiterType;
}

export default class RateLimiter {
    private limiter: AbstractRateLimiter;

    constructor(options: RateLimiterOptions) {
        const { redisClient, window, maxRequests, type } = options;

        switch (type) {
            case RateLimiterType.FixedWindow:
                this.limiter = new FixedWindowLimiter(redisClient, window, maxRequests);
                break;
            // Uncomment and implement this when adding the sliding window limiter
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
