'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import the ABI
import NFTMarketplaceArtifact from '../../../../web3/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

const NFT_MARKETPLACE_ABI = NFTMarketplaceArtifact.abi;
const NFT_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

interface Property {
  propertyId: bigint;
  tokenId: bigint;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
  propertyType: string;
  propertyImage: string;
  squareFootage: bigint;
  location: string;
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchMyProperties();
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this feature');
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const fetchMyProperties = async () => {
    setIsLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this feature');
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

      const myProperties = await contract.fetchMyProperties();
      setProperties(myProperties);

      // Initialize currentImageIndex for each property
      const initialImageIndices = myProperties.reduce((acc: { [key: number]: number }, property: Property) => {
        acc[Number(property.propertyId)] = 0;
        return acc;
      }, {});
      setCurrentImageIndex(initialImageIndices);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeImage = (propertyId: bigint, direction: 'next' | 'prev') => {
    setCurrentImageIndex((prevIndices) => {
      const currentIndex = prevIndices[Number(propertyId)] || 0;
      const totalImages = 4; // Assuming 4 images per property
      let newIndex;

      if (direction === 'next') {
        newIndex = (currentIndex + 1) % totalImages;
      } else {
        newIndex = (currentIndex - 1 + totalImages) % totalImages;
      }

      return { ...prevIndices, [Number(propertyId)]: newIndex };
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading properties...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Properties</h1>
        {walletAddress && (
          <p className="mb-4">Connected Wallet: {walletAddress}</p>
        )}
        {properties.length === 0 ? (
          <p>You don't own any properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.propertyId.toString()} className="w-full">
                <CardHeader>
                  <CardTitle>{property.propertyType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-w-16 aspect-h-9 mb-4">
                    <Image
                      src={property.propertyImage || `/placeholder${(currentImageIndex[Number(property.propertyId)] % 4) + 1}.jpg`}
                      alt={`Property ${property.propertyId}`}
                      width={400}
                      height={225}
                      className="rounded-lg object-cover"
                    />
                    <button
                      onClick={() => changeImage(property.propertyId, 'prev')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => changeImage(property.propertyId, 'next')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold">Value: {ethers.formatEther(property.price)} MATIC</p>
                  <p>{property.squareFootage.toString()} sq ft</p>
                  <p>{property.location}</p>
                  <p>Token ID: {property.tokenId.toString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}