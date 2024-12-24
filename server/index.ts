import express, { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";
import RateLimiter, { RateLimiterType } from "../src";
// import { RateLimiterType } from "../src/types";

const redisClient = new Redis(
    "rediss://default:AYbPAAIjcDEwZWQ3MmUyMWEyMTY0ZmU4YTg4NTk2ZjE1MzA2MjU2OHAxMA@helpful-monkey-34511.upstash.io:6379"
);

const app = express();

app.use(express.json());

const fixedWindowLimiter = new RateLimiter({
    type: RateLimiterType.FixedWindow,
    redisClient,
    window: 60,
    maxRequests: 10,
});

app.get(
    "/",
    fixedWindowLimiter.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("Request successful");
            res.send("API hit successfully");
        } catch (err) {
        }
    }
);

app.get(
    "/hello",
    fixedWindowLimiter.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("Request successful");
            res.send("API hit successfully 2");
        } catch (err) {
        }
    }
);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
