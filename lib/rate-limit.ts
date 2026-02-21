// /**
//  * Simple in-memory rate limiter.
//  * For production at scale, replace with Upstash Redis rate limiter.
//  */

// const rateMap = new Map<string, { count: number; resetAt: number }>();

// // Clean old entries every 5 minutes
// setInterval(() => {
//     const now = Date.now();
//     for (const [key, value] of rateMap) {
//         if (value.resetAt < now) {
//             rateMap.delete(key);
//         }
//     }
// }, 5 * 60 * 1000);

// export interface RateLimitConfig {
//     /** Max requests per window */
//     maxRequests: number;
//     /** Window duration in milliseconds */
//     windowMs: number;
// }

// export interface RateLimitResult {
//     allowed: boolean;
//     remaining: number;
//     resetAt: number;
// }

// export function checkRateLimit(
//     key: string,
//     config: RateLimitConfig
// ): RateLimitResult {
//     const now = Date.now();
//     const entry = rateMap.get(key);

//     if (!entry || entry.resetAt < now) {
//         // First request or window expired
//         rateMap.set(key, { count: 1, resetAt: now + config.windowMs });
//         return {
//             allowed: true,
//             remaining: config.maxRequests - 1,
//             resetAt: now + config.windowMs,
//         };
//     }

//     if (entry.count >= config.maxRequests) {
//         return {
//             allowed: false,
//             remaining: 0,
//             resetAt: entry.resetAt,
//         };
//     }

//     entry.count++;
//     return {
//         allowed: true,
//         remaining: config.maxRequests - entry.count,
//         resetAt: entry.resetAt,
//     };
// }

/**
 * Rate limiter DISABLED for serverless stability.
 *
 * Why:
 * - In-memory Maps do NOT work reliably on Vercel
 * - setInterval does NOT behave correctly in serverless
 * - Auth flows trigger multiple backend calls
 *
 * Replace this later with:
 * - Vercel KV
 * - Upstash Redis
 */

export interface RateLimitConfig {
    /** Max requests per window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

export function checkRateLimit(): RateLimitResult {
    return {
        allowed: true,
        remaining: Infinity,
        resetAt: Date.now(),
    };
}