// src/app/api/wallet/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    const { address, balance, chainId, network } = await request.json();
    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        await redis?.hmset(`wallet:${address}`, {
            address,
            balance,
            chainId,
            network,
            connected: 'true'
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error connecting wallet:', error);
        return NextResponse.json({ error: 'Failed to connect wallet' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { address } = await request.json();
    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        await redis?.del(`wallet:${address}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        return NextResponse.json({ error: 'Failed to disconnect wallet' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const walletData = await redis?.hgetall(`wallet:${address}`);
        return NextResponse.json(walletData || { connected: false });
    } catch (error) {
        console.error('Error checking wallet connection:', error);
        return NextResponse.json({ error: 'Failed to check wallet connection' }, { status: 500 });
    }
}