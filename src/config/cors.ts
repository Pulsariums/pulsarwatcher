import { cors } from "hono/cors";
import { env } from "./env.js";

const parseOrigins = (origins: string): string[] => {
    if (origins === "*") return ["*"];
    return origins.split(",").map((o) => o.trim()).filter(Boolean);
};

const allowedOrigins = parseOrigins(env.CORS_ALLOWED_ORIGINS);

export const corsConfig = cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-Cache-Status"],
    maxAge: 600, // 10 minutes
    credentials: true,
});
