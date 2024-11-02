// hooks/usePropertySearch.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContractInstance } from '@/utils/contractUtil';
import { Property, ContractProperty, SearchCriteria } from '@/types/searchProps';

export function usePropertySearch(initialValues: SearchCriteria) {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertContractPropertyToProperty = (property: ContractProperty): Property => ({
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
  });

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!process.env.NEXT_PUBLIC_RPC_URL) {
        throw new Error('RPC URL not configured');
      }

      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const contract = await getContractInstance(provider);

      // Fetch properties from contract
      let properties: ContractProperty[];
      try {
        properties = await contract.fetchAvailableProperties();
      } catch (err) {
        console.error('Contract call failed:', err);
        if (err instanceof Error && err.message.includes('CALL_EXCEPTION')) {
          throw new Error('Unable to fetch properties. The contract might not be initialized properly.');
        }
        throw err;
      }
      
      // Convert and filter properties
      let processedProperties = properties.map(convertContractPropertyToProperty);

      // Apply search filters
      if (initialValues.search) {
        const searchTerm = initialValues.search.toLowerCase();
        processedProperties = processedProperties.filter(property =>
          property.propertyType.toLowerCase().includes(searchTerm) ||
          property.location.toLowerCase().includes(searchTerm)
        );
      }

      if (initialValues.propertyType && initialValues.propertyType !== 'all') {
        processedProperties = processedProperties.filter(property =>
          property.propertyType.toLowerCase() === initialValues.propertyType.toLowerCase()
        );
      }

      if (initialValues.minPrice) {
        try {
          const minPriceWei = ethers.parseEther(initialValues.minPrice);
          processedProperties = processedProperties.filter(property =>
            BigInt(property.price) >= minPriceWei
          );
        } catch (err) {
          console.error('Error parsing minimum price:', err);
        }
      }

      if (initialValues.maxPrice) {
        try {
          const maxPriceWei = ethers.parseEther(initialValues.maxPrice);
          processedProperties = processedProperties.filter(property =>
            BigInt(property.price) <= maxPriceWei
          );
        } catch (err) {
          console.error('Error parsing maximum price:', err);
        }
      }

      if (initialValues.location) {
        const locationTerm = initialValues.location.toLowerCase();
        processedProperties = processedProperties.filter(property =>
          property.location.toLowerCase().includes(locationTerm)
        );
      }

      setFilteredProperties(processedProperties);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setFilteredProperties([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  }, [initialValues]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    filteredProperties,
    isLoading,
    error,
    fetchProperties,
  };
}