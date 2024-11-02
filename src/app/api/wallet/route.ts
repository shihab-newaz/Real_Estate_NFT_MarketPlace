// src/app/api/wallet/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * Wallet API Route Handler
 * This file handles wallet connection, disconnection, and status checking
 * using Redis for persistent storage.
 */


/**
 * POST /api/wallet
 * Connects a wallet by storing its data in Redis
 * 
 * @param request - Contains wallet data in the body:
 *   - address: Wallet address (required)
 *   - balance: Current wallet balance
 *   - chainId: Connected chain ID
 *   - network: Network name
 * 
 * @returns 
 *   - Success: { success: true }
 *   - Error: { error: string } with appropriate status code
 */
export async function POST(request: Request) {
    // Extract wallet data from request body
    const { address, balance, chainId, network } = await request.json();

    // Validate required address field
    if (!address) {
        return NextResponse.json(
            { error: 'Address is required' }, 
            { status: 400 }
        );
    }

    try {
        // Store wallet data in Redis using hash set
        // Key format: wallet:{address}
        // Values: address, balance, chainId, network, connected status
        await redis?.hmset(`wallet:${address}`, {
            address,
            balance,
            chainId,
            network,
            connected: 'true'  // Flag to indicate active connection
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error connecting wallet:', error);
        return NextResponse.json(
            { error: 'Failed to connect wallet' }, 
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/wallet
 * Disconnects a wallet by removing its data from Redis
 * 
 * @param request - Contains wallet address in the body:
 *   - address: Wallet address to disconnect (required)
 * 
 * @returns
 *   - Success: { success: true }
 *   - Error: { error: string } with appropriate status code
 */
export async function DELETE(request: Request) {
    // Extract address from request body
    const { address } = await request.json();

    // Validate required address field
    if (!address) {
        return NextResponse.json(
            { error: 'Address is required' }, 
            { status: 400 }
        );
    }

    try {
        // Remove wallet data from Redis
        // Using del command to remove the entire hash
        await redis?.del(`wallet:${address}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect wallet' }, 
            { status: 500 }
        );
    }
}

/**
 * GET /api/wallet
 * Checks wallet connection status and retrieves wallet data
 * 
 * @param request - Contains wallet address in query params:
 *   - address: Wallet address to check (required)
 * 
 * @returns
 *   - Success with data: { address, balance, chainId, network, connected }
 *   - Success but not connected: { connected: false }
 *   - Error: { error: string } with appropriate status code
 */
export async function GET(request: Request) {
    // Extract address from query parameters
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Validate required address parameter
    if (!address) {
        return NextResponse.json(
            { error: 'Address is required' }, 
            { status: 400 }
        );
    }

    try {
        // Retrieve all fields of the wallet hash from Redis
        // hgetall returns null if the key doesn't exist
        const walletData = await redis?.hgetall(`wallet:${address}`);

        // Return wallet data if found, otherwise return disconnected status
        return NextResponse.json(walletData || { connected: false });
    } catch (error) {
        console.error('Error checking wallet connection:', error);
        return NextResponse.json(
            { error: 'Failed to check wallet connection' }, 
            { status: 500 }
        );
    }
}

