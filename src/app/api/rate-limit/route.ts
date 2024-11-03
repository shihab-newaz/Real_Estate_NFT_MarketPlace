// app/api/rate-limit/route.ts
import { NextRequest } from 'next/server';
import redis from '@/lib/redis';
import { withRateLimit, getRateLimitIdentifier } from '@/lib/rateLimiter';

export const runtime = 'edge'; // Use edge runtime for better performance

export async function GET(request: NextRequest) {
  try {
    const identifier = await getRateLimitIdentifier();
    
    // Configure rate limit: 30 requests per minute
    const rateLimitResponse = await withRateLimit(redis, identifier, {
      interval: 60,  // 1 minute
      maxRequests: 30
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Rate limit check passed'
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        }
      }
    );
  } catch (error) {
    console.error('Rate limit check error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        }
      }
    );
  }
}