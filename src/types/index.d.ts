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