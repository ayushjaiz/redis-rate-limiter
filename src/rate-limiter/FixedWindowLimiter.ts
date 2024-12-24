import AbstractRateLimiter from "./AbstractRateLimiter";
import { RateLimiterOptions } from "..";

class FixedWindowLimiter extends AbstractRateLimiter {
    constructor(options: RateLimiterOptions) {
        super(options);
    }

    async validate(key: string): Promise<boolean> {
        const requestCount = await this.redisClient.incr(key);

        let ttl: number;
        if (requestCount === 1) {
            await this.redisClient.expire(key, this.windowInSeconds);
            ttl = this.windowInSeconds;
        } else {
            ttl = await this.redisClient.ttl(key);
        }

        return requestCount <= this.maxRequests;
    }
}

export default FixedWindowLimiter;
