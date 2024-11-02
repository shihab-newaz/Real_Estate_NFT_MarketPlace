// components/shared/PropertyGrid.tsx
import React from 'react';
import PropertyCard from '@/components/shared/PropertyCard';
import { Property,PropertyCardProps } from '@/types/property';

export interface PropertyGridProps {
  properties: Property[];
  onBuyProperty: (propertyId: bigint) => void;
}

export default function PropertyGrid({ properties, onBuyProperty }: PropertyGridProps) {
  const convertToPropertyCardProps = (property: Property): PropertyCardProps => ({
    propertyId: property.propertyId.toString(),
    tokenId: property.tokenId.toString(),
    seller: property.seller,
    owner: property.owner,
    price: property.price.toString(),
    sold: property.sold,
    propertyType: property.propertyType,
    propertyImage: property.propertyImage,
    squareFootage: property.squareFootage.toString(),
    location: property.location
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => {
        const cardProps = convertToPropertyCardProps(property);
        return (
          <PropertyCard
            key={cardProps.propertyId}
            property={cardProps}
            onBuyClick={() => onBuyProperty(BigInt(property.propertyId))}
          />
        );
      })}
    </div>
  );
}