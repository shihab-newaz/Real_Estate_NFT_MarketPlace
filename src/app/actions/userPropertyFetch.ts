// src/app/actions/myPropertiesActions.ts
'use server'

import { ethers } from 'ethers';
import { revalidatePath } from 'next/cache';
import { NFT_MARKETPLACE_ABI, NFT_MARKETPLACE_ADDRESS } from '@/utils/contractUtil';
import { Property } from '@/types/property';
import { cookies } from 'next/headers';

export async function fetchUserProperties(address: string | null): Promise<{
  properties?: Property[];
  error?: string;
}> {
  try {
    if (!address) {
      return { properties: [] };
    }

    // Get the RPC URL from environment variables
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC URL not configured');
    }

    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      NFT_MARKETPLACE_ADDRESS,
      NFT_MARKETPLACE_ABI,
      provider
    );

    // Fetch properties
    const rawProperties = await contract.fetchMyProperties({ from: address });

    // Format the properties
    const formattedProperties: Property[] = rawProperties.map((prop: any) => ({
      propertyId: prop.propertyId.toString(),
      tokenId: prop.tokenId.toString(),
      seller: prop.seller,
      owner: prop.owner,
      price: prop.price.toString(),
      sold: prop.sold,
      propertyType: prop.propertyType,
      propertyImage: prop.propertyImage || '/property(2).png',
      squareFootage: prop.squareFootage.toString(),
      location: prop.location,
    })).filter((prop: Property) => prop.owner.toLowerCase() === address.toLowerCase());

    // Store the fetched properties in cookies for hydration
    cookies().set('myProperties', JSON.stringify(formattedProperties), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    // Revalidate the page
    revalidatePath('/my-properties');

    return { properties: formattedProperties };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch properties'
    };
  }
}