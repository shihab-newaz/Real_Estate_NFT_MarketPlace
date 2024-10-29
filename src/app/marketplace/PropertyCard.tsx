// app/marketplace/PropertyCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { BuyButton } from './BuyButton';

interface PropertyCardProps {
  propertyId: string;
  tokenId: string;
  seller: string;
  owner: string;
  price: string;
  sold: boolean;
  propertyType: string;
  propertyImage: string;
  squareFootage: string;
  location: string;
  onPropertyBought: (propertyId: string) => void;
}

export default function PropertyCard(props: PropertyCardProps) {
  const {
    propertyId,
    tokenId,
    seller,
    owner,
    price,
    sold,
    propertyType,
    propertyImage,
    squareFootage,
    location,
    onPropertyBought
  } = props;

  const formatPrice = (priceString: string) => {
    try {
      const priceBigInt = BigInt(priceString);
      return `${ethers.formatEther(priceBigInt)} MATIC`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'Price not available';
    }
  };

  const handlePropertyBought = () => {
    onPropertyBought(propertyId);
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle>{propertyType || 'Unknown Type'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative aspect-w-16 aspect-h-9 mb-4">
          <Image
            src={propertyImage || "/placeholder-property.jpg"}
            alt={`Property ${propertyId}`}
            width={400}
            height={225}
            className="rounded-lg object-cover"
          />
        </div>
        <p className="text-lg font-semibold">
          {formatPrice(price)}
        </p>
        <p>{squareFootage} sq ft</p>
        <p>{location || 'Location not specified'}</p>
        <p className="text-sm text-gray-500">
          Seller: {seller ? `${seller.slice(0, 6)}...${seller.slice(-4)}` : 'Unknown'}
        </p>
      </CardContent>
      <CardFooter>
      <BuyButton property={props} onPropertyBought={handlePropertyBought} />
      </CardFooter>
    </Card>
  );
}