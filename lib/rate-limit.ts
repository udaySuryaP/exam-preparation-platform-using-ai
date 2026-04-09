/**
 * Rate limiter using Upstash Redis.
 * Works correctly across all serverless instances and devices.
 * Fallback: if env vars are missing (local dev), allows all requests.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
    /** Max requests per window */
    maxRequests: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

// Lazily create the Redis client so missing env vars in dev don't crash at import time
let redis: Redis | null = null;
function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    return redis;
}

// Cache limiters by key so we don't recreate them on every request
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(config: RateLimitConfig): Ratelimit | null {
    const r = getRedis();
    if (!r) return null;

    const cacheKey = `${config.maxRequests}:${config.windowSeconds}`;
    if (!limiterCache.has(cacheKey)) {
        limiterCache.set(
            cacheKey,
            new Ratelimit({
                redis: r,
                limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
                analytics: false,
            })
        );
    }
    return limiterCache.get(cacheKey)!;
}

export async function checkRateLimit(
    key: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const limiter = getLimiter(config);

    // Graceful degradation depends on environment
    if (!limiter) {
        if (process.env.NODE_ENV === "production") {
            console.error("[RateLimit] Upstash Redis not configured in production — blocking request.");
            return {
                allowed: false,
                remaining: 0,
                resetAt: Date.now() + config.windowSeconds * 1000,
            };
        }
        console.warn("[RateLimit] Upstash Redis not configured — rate limiting disabled (dev mode).");
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetAt: Date.now() + config.windowSeconds * 1000,
        };
    }

    try {
        const result = await limiter.limit(key);
        return {
            allowed: result.success,
            remaining: result.remaining,
            resetAt: result.reset,
        };
    } catch (err) {
        console.error("[RateLimit] Upstash error:", err instanceof Error ? err.message : err);
        if (process.env.NODE_ENV === "production") {
            // Fail closed in production — block when uncertain
            return {
                allowed: false,
                remaining: 0,
                resetAt: Date.now() + config.windowSeconds * 1000,
            };
        }
        // Fail open in development
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetAt: Date.now() + config.windowSeconds * 1000,
        };
    }
}
