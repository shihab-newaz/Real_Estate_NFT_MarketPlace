'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NFT_MARKETPLACE_ABI } from '@/utils/contractUtil';
import { useWalletConnection } from '@/hooks/useWalletConnection';

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
  const { address, connectWallet } = useWalletConnection();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyProperties = useCallback(async () => {
    if (!address) return;
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
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchMyProperties();
    } else {
      setIsLoading(false);
    }
  }, [address, fetchMyProperties]);

  const changeImage = useCallback((propertyId: bigint, direction: 'next' | 'prev') => {
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
  }, []);

  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => Number(b.price - a.price));
  }, [properties]);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">My Properties</h1>
        <p className="mb-4">Please connect your wallet to view your properties.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Properties</h1>
        <p className="mb-4">Connected Wallet: {address}</p>
        {sortedProperties.length === 0 ? (
          <p className="text-center text-xl mt-8">You don't own any properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((property) => (
              <Card key={property.propertyId.toString()} className="w-full">
                <CardHeader>
                  <CardTitle>{property.propertyType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-w-16 aspect-h-9 mb-4">
                    <Image
                      // src={  property.propertyImage || `/property(2).png`}
                      src={  `/property(2).png`}
                      alt={`Property ${property.propertyId}`}
                      width={400}
                      height={225}
                      className="rounded-lg object-cover"
                    />
                    <button
                      onClick={() => changeImage(property.propertyId, 'prev')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => changeImage(property.propertyId, 'next')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold">Value: {ethers.formatEther(property.price)} MATIC</p>
                  <p>{property.squareFootage.toString()} sq ft</p>
                  <p>{property.location}</p>
                  <p>Token ID: {property.tokenId.toString()}</p>
                  {property.sold && <p className="text-red-500 font-bold mt-2">SOLD</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}