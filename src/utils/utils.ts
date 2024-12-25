import { Request } from "express";

const getClientIp = (req: Request): string => {
    return (
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        ""
    )
        .split(",")[0]
        .trim();
};

/**
 * Generates a unique key for rate limiting based on IP and URL.
 */
export const generateRateLimiterKey = (req: Request): string => {
    const ip = getClientIp(req);
    const url = req.originalUrl || req.url;
    return `${ip}:${url}`;
};
