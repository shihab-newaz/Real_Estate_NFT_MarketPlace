// app/actions/propertyFetch.ts
'use server';

import { ethers } from 'ethers';
import { NFT_MARKETPLACE_ABI, NFT_MARKETPLACE_ADDRESS } from '@/utils/contractUtil';
import { Property } from '@/types/property';
import { revalidatePath } from 'next/cache';


export async function fetchProperties() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(
      NFT_MARKETPLACE_ADDRESS,
      NFT_MARKETPLACE_ABI,
      provider
    );

    const properties = await contract.fetchAvailableProperties();
    
    // Convert BigInt values to strings for serialization
    return properties.map((property: any) => ({
      propertyId: property.propertyId.toString(),
      tokenId: property.tokenId.toString(),
      seller: property.seller,
      owner: property.owner,
      price: property.price.toString(),
      sold: property.sold,
      propertyType: property.propertyType,
      propertyImage: property.propertyImage,
      squareFootage: property.squareFootage.toString(),
      location: property.location,
    }));
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

