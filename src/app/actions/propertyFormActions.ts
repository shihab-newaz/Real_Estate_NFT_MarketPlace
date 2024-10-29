// src/app/actions/propertyActions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { ethers } from 'ethers'
import { NFT_MARKETPLACE_ABI } from "@/utils/contractUtil"
import { uploadToIPFS } from "@/utils/ipfsUtil"

interface PropertyFormData {
  name: string
  description: string
  propertyType: string
  propertyImage: string
  squareFootage: string
  location: string
  price: string
}

export async function mintPropertyToken(formData: PropertyFormData) {
  try {
    // Prepare metadata for IPFS
    const metadata = {
      name: formData.name,
      description: formData.description,
      image: formData.propertyImage,
      price: formData.price,
      attributes: [
        { trait_type: "Property Type", value: formData.propertyType },
        { trait_type: "Square Footage", value: formData.squareFootage },
        { trait_type: "Location", value: formData.location },
      ],
    }

    // Upload metadata to IPFS
    const ipfsHash = await uploadToIPFS(metadata)
    const tokenURI = `https://ipfs.io/ipfs/${ipfsHash}`

    // Return the token URI for the next step
    return { success: true, tokenURI }
  } catch (error) {
    console.error("Mint token error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function listProperty(
  tokenId: bigint,
  formData: PropertyFormData,
  listingFee: bigint,
  NFT_MARKETPLACE_ADDRESS: string
) {
  try {
    const priceInWei = ethers.parseEther(formData.price)
    
    // Return the transaction parameters for the client to execute
    return {
      success: true,
      params: {
        tokenId,
        priceInWei,
        propertyType: formData.propertyType,
        propertyImage: formData.propertyImage,
        squareFootage: BigInt(formData.squareFootage),
        location: formData.location,
        listingFee
      }
    }
  } catch (error) {
    console.error("List property error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}