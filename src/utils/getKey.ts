import { Request } from "express";
import { getClientIp } from "../utils/getClientIp";

/**
 * Generates a unique key for rate limiting based on IP and URL.
 * @param req - Express request object.
 * @returns The generated key as a string.
 */
export const generateRateLimiterKey = (req: Request): string => {
    const ip = getClientIp(req);
    const url = req.originalUrl || req.url;
    return `${ip}:${url}`;
};
