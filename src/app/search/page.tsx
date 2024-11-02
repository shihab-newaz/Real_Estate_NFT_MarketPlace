"use client";

import React, { useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, ReadonlyURLSearchParams } from "next/navigation";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { PurchaseDialog } from "@/components/shared/PurchaseDialog";
import SearchForm from "@/components/shared/SearchForm";
import PropertyGrid from "@/components/shared/PropertyGrid";
import { Property, PropertyCardProps, SearchCriteria } from '@/types/searchProps';

function SearchParamsWrapper({
  children,
}: {
  children: (searchParams: ReadonlyURLSearchParams) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

interface SearchPageContentProps {
  searchParams: ReadonlyURLSearchParams;
}

function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  
  // Get all initial search parameters
  const initialValues: SearchCriteria = {
    search: searchParams?.get("term") || "",
    propertyType: searchParams?.get("type") || "all",
    minPrice: searchParams?.get("minPrice") || "",
    maxPrice: searchParams?.get("maxPrice") || "",
    location: searchParams?.get("location") || "",
  };

  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyCardProps | null>(null);

  // Initialize property search hook with all search parameters
  const {
    filteredProperties,
    isLoading,
    error,
    fetchProperties,
  } = usePropertySearch(initialValues);

  // Handle search form submission
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const params = new URLSearchParams();
    
    // Get all form values
    const searchTerm = formData.get('search') as string;
    const propertyType = formData.get('propertyType') as string;
    const minPrice = formData.get('minPrice') as string;
    const maxPrice = formData.get('maxPrice') as string;
    const location = formData.get('location') as string;

    // Add non-empty values to URL parameters
    if (searchTerm) params.set('term', searchTerm);
    if (propertyType && propertyType !== 'all') params.set('type', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location) params.set('location', location);

    // Update URL and trigger search
    router.push(`/search?${params.toString()}`);
  }, [router]);

  // Convert Property to PropertyCardProps
  const convertToPropertyCardProps = (property: Property): PropertyCardProps => ({
    propertyId: property.propertyId,
    tokenId: property.tokenId,
    seller: property.seller,
    owner: property.owner,
    price: property.price,
    sold: property.sold,
    propertyType: property.propertyType,
    propertyImage: property.propertyImage,
    squareFootage: property.squareFootage,
    location: property.location
  });

  // Handle property purchase
  const handleBuyProperty = useCallback((propertyId: bigint) => {
    const property = filteredProperties.find(p => BigInt(p.propertyId) === propertyId);
    if (!property) return;

    const propertyCardProps = convertToPropertyCardProps(property);
    setSelectedProperty(propertyCardProps);
    setIsDialogOpen(true);
  }, [filteredProperties]);

  // Handle successful purchase
  const handlePurchaseComplete = useCallback(() => {
    fetchProperties();
    setSelectedProperty(null);
    setIsDialogOpen(false);
  }, [fetchProperties]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-lg text-red-600">
              Error loading properties: {error}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Properties</h1>

        <SearchForm
          onSubmit={handleSearch}
          isMarketplace={false}
          initialValues={initialValues}
        />

        <div className="mt-8">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">
                No properties match your search criteria.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Found {filteredProperties.length} properties matching your criteria
              </p>
              <PropertyGrid
                properties={filteredProperties.map(p => ({
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
            </>
          )}
        </div>

        <PurchaseDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          property={selectedProperty}
          onPurchaseComplete={handlePurchaseComplete}
        />
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchParamsWrapper>
        {(searchParams) => <SearchPageContent searchParams={searchParams} />}
      </SearchParamsWrapper>
    </Suspense>
  );
}