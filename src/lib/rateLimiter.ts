// src/lib/rateLimiter.ts
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface RateLimitConfig {
  interval: number; // Time window in seconds
  maxRequests: number; // Maximum requests allowed in the time window
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
  }

  private getKey(identifier: string): string {
    return `ratelimit:${identifier}`;
  }

  async isRateLimited(identifier: string): Promise<{
    limited: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const key = this.getKey(identifier);

    // Use Upstash Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();

    // Remove old requests
    pipeline.zremrangebyscore(key, 0, now - this.config.interval);

    // Add current request with score as current timestamp
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Get the count of requests in the current window
    pipeline.zcard(key);

    // Set expiry on the key
    pipeline.expire(key, this.config.interval);

    const [, , requestCount] = await pipeline.exec();

    const isLimited = (requestCount as number) > this.config.maxRequests;

    // Get the oldest request timestamp for reset time calculation
    const oldestRequest: { score: number }[] = await this.redis.zrange(
      key,
      0,
      0,
      {
        withScores: true,
      }
    );
    const resetTime = oldestRequest.length
      ? Math.floor(oldestRequest[0].score) + this.config.interval
      : now + this.config.interval;

    return {
      limited: isLimited,
      remaining: Math.max(
        0,
        this.config.maxRequests - (requestCount as number)
      ),
      reset: resetTime,
    };
  }
}

// Fixed window rate limiter using Upstash Redis
export async function fixedWindowRateLimit(
  redis: Redis,
  identifier: string,
  config: RateLimitConfig = { interval: 60, maxRequests: 30 }
): Promise<{
  limited: boolean;
  remaining: number;
  reset: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / config.interval);
  const key = `ratelimit:${identifier}:${windowKey}`;

  const [count] = await redis
    .pipeline()
    .incr(key)
    .expire(key, config.interval)
    .exec();

  const requestCount = count as number;

  return {
    limited: requestCount > config.maxRequests,
    remaining: Math.max(0, config.maxRequests - requestCount),
    reset: (windowKey + 1) * config.interval,
  };
}

// Middleware helper for rate limiting
export async function withRateLimit(
  redis: Redis | null,
  identifier: string,
  config: RateLimitConfig = { interval: 60, maxRequests: 30 }
) {
  if (!redis) {
    console.warn("Redis not configured, skipping rate limiting");
    return null;
  }

  try {
    // Use fixed window rate limiting for better performance with Upstash
    const result = await fixedWindowRateLimit(redis, identifier, config);

    if (result.limited) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: result.reset - Math.floor(Date.now() / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": (
              result.reset - Math.floor(Date.now() / 1000)
            ).toString(),
          },
        }
      );
    }

    return null;
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow the request if rate limiting fails
    return null;
  }
}

// Get rate limit identifier from request
export async function getRateLimitIdentifier() {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `property-search:${ip}`;
}
