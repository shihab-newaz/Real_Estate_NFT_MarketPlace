// components/shared/PropertyCard.tsx
import React from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyCardComponentProps } from '@/types/property';

export default function PropertyCard({ property, onBuyClick }: PropertyCardComponentProps) {
  const formatPrice = (priceString: string) => {
    try {
      return `${ethers.formatEther(priceString)} MATIC`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'Price not available';
    }
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle>{property.propertyType || 'Unknown Type'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative aspect-w-16 aspect-h-9 mb-4">
          <Image
            src={property.propertyImage || "/placeholder-property.jpg"}
            alt={`Property ${property.propertyId}`}
            width={400}
            height={225}
            className="rounded-lg object-cover"
          />
        </div>
        <p className="text-lg font-semibold">
          {formatPrice(property.price)}
        </p>
        <p>{property.squareFootage} sq ft</p>
        <p>{property.location || 'Location not specified'}</p>
        <p className="text-sm text-gray-500">
          Seller: {property.seller ? `${property.seller.slice(0, 6)}...${property.seller.slice(-4)}` : 'Unknown'}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onBuyClick} className="w-full">
          Buy Property
        </Button>
      </CardFooter>
    </Card>
  );
}