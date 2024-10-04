'use client';
// app/marketplace/page.tsx
import React,{ useState, useEffect } from "react";
import { ethers } from "ethers";
import { NFT_MARKETPLACE_ABI, NFT_MARKETPLACE_ADDRESS } from '@/utils/contractUtil';
import SearchForm from './SearchForm';
import PropertyCard from './PropertyCard';

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

async function getProperties() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const contract = new ethers.Contract(
    NFT_MARKETPLACE_ADDRESS,
    NFT_MARKETPLACE_ABI,
    provider
  );

  try {
    const allProperties = await contract.fetchAvailableProperties();
    // Filter out sold properties
    const availableProperties = allProperties.filter((property: Property) => !property.sold);
    return availableProperties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function fetchProperties() {
      const fetchedProperties = await getProperties();
      setProperties(fetchedProperties);
    }
    fetchProperties();
  }, []);

  const handlePropertyBought = (boughtPropertyId: string) => {
    setProperties(prevProperties => 
      prevProperties.filter(property => property.propertyId.toString() !== boughtPropertyId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Real Estate NFT Marketplace</h1>
        <SearchForm initialProperties={properties} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: Property) => (
            <PropertyCard 
              key={property.propertyId.toString()} 
              propertyId={property.propertyId.toString()}
              tokenId={property.tokenId.toString()}
              seller={property.seller}
              owner={property.owner}
              price={property.price.toString()}
              sold={property.sold}
              propertyType={property.propertyType}
              propertyImage={property.propertyImage}
              squareFootage={property.squareFootage.toString()}
              location={property.location}
              onPropertyBought={handlePropertyBought}
            />
          ))}
        </div>
      </main>
    </div>
  );
}