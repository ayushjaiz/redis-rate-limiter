import AbstractRateLimiter from "./AbstractRateLimiter";
import { RateLimiterOptions } from "..";

class SlidingWindowLimiter extends AbstractRateLimiter {
    constructor(options: RateLimiterOptions) {
        super(options);
    }

    /**
     * Validates if the request is within the allowed rate limits using the sliding window algorithm.
     * @param key - The unique key for rate limiting (IP + URL).
     * @returns Promise<boolean> - True if the request is allowed, false otherwise.
     */
    protected async validate(key: string): Promise<boolean> {
        const currentTimestamp = Date.now();
        const windowStartTimestamp = currentTimestamp - this.windowInSeconds * 1000;

        // Use a sorted set in Redis to keep track of request timestamps
        try {
            // Add the current timestamp to the sorted set
            await this.redisClient.zadd(key, currentTimestamp, currentTimestamp.toString());

            // Remove timestamps that are outside the current sliding window
            await this.redisClient.zremrangebyscore(key, 0, windowStartTimestamp);

            // Count the number of requests within the current sliding window
            const requestCount = await this.redisClient.zcard(key);

            // Set expiration for the key to avoid stale data
            await this.redisClient.expire(key, this.windowInSeconds);

            // Allow or reject the request based on the count
            return requestCount <= this.maxRequests;
        } catch (error) {
            console.error("Error during sliding window rate limit validation:", error);
            throw new Error("Rate limiter validation failed");
        }
    }
}

export default SlidingWindowLimiter;
