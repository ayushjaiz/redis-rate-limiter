import AbstractRateLimiter from "./AbstractRateLimiter";
import { RateLimiterOptions } from "..";

class SlidingWindowLimiter extends AbstractRateLimiter {
    constructor(options: RateLimiterOptions) {
        super(options);
    }

    protected async validate(key: string): Promise<boolean> {
        const currentTimestamp = Date.now();
        const startingAllowedTimestamp =
            currentTimestamp - this.windowInSeconds * 1000;

        // Using sorted sorts
        try {
            // Remove timestamps that are outside the current sliding window
            await this.redisClient.zremrangebyscore(key, 0, startingAllowedTimestamp);

            // Count the number of requests within the current sliding window
            const requestCount = await this.redisClient.zcard(key);

            // Reject
            if (requestCount >= this.maxRequests) {
                return false;
            }

            // Add the current timestamp
            await this.redisClient.zadd(
                key,
                currentTimestamp,
                currentTimestamp.toString()
            );

            // Set expiration for the key
            await this.redisClient.expire(key, this.windowInSeconds);

            return true;
        } catch (error) {
            console.error(
                "Error during sliding window rate limit validation:",
                error
            );
            throw new Error("Rate limiter validation failed");
        }
    }
}

export default SlidingWindowLimiter;
