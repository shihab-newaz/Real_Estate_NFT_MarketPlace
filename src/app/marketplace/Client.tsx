"use client";
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyGrid from "@/components/shared/PropertyGrid";
import SearchForm from "@/components/shared/SearchForm";
import { PurchaseDialog } from "@/components/shared/PurchaseDialog";
import { PropertyCardProps } from '@/types/property';

interface MarketplaceClientProps {
  initialProperties: PropertyCardProps[];
}

export default function MarketplaceClient({ initialProperties }: MarketplaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties] = useState<PropertyCardProps[]>(initialProperties);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyCardProps | null>(null);

  // Handle property purchase
  const handleBuyProperty = useCallback((propertyId: bigint) => {
    const property = properties.find(p => BigInt(p.propertyId) === propertyId);
    if (!property) return;
    
    setSelectedProperty(property);
    setIsDialogOpen(true);
  }, [properties]);

  // Updated search handler to redirect to search page
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const searchParams = new URLSearchParams();
    
    // Get all form data and add to search params
    const searchTerm = formData.get('search') as string;
    const propertyType = formData.get('propertyType') as string;
    const minPrice = formData.get('minPrice') as string;
    const maxPrice = formData.get('maxPrice') as string;
    const location = formData.get('location') as string;

    // Only add parameters that have values
    if (searchTerm) searchParams.set('term', searchTerm);
    if (propertyType) searchParams.set('type', propertyType);
    if (minPrice) searchParams.set('minPrice', minPrice);
    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    if (location) searchParams.set('location', location);
    
    // Redirect to search page with query parameters
    router.push(`/search?${searchParams.toString()}`);
  }, [router]);

  // Handle successful purchase
  const handlePurchaseComplete = useCallback(() => {
    router.refresh(); // Refresh the page to get updated property list
    setSelectedProperty(null);
  }, [router]);

  return (
    <>
      <SearchForm
        onSubmit={handleSearch}
        isMarketplace={true}
        initialValues={{
          search: '',
          propertyType: 'all',
          minPrice: '',
          maxPrice: '',
          location: ''
        }}
      />
      
      {properties.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            No properties available at the moment.
          </p>
        </div>
      ) : (
        <PropertyGrid
          properties={properties.map(p => ({
            propertyId: BigInt(p.propertyId),
            tokenId: BigInt(p.tokenId),
            seller: p.seller,
            owner: p.owner,
            price: BigInt(p.price),
            sold: p.sold,
            propertyType: p.propertyType,
            propertyImage: p.propertyImage,
            squareFootage: BigInt(p.squareFootage),
            location: p.location
          }))}
          onBuyProperty={handleBuyProperty}
        />
      )}

      <PurchaseDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={selectedProperty}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </>
  );
}