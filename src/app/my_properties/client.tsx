// src/app/my-properties/Client.tsx
'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { Property } from '@/types/property';
import { fetchUserProperties } from "@/app/actions/userPropertyFetch";
import { PropertyCard } from './card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface MyPropertiesClientProps {
  initialProperties: Property[];
}

export function MyPropertiesClient({ initialProperties }: MyPropertiesClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [isPending, startTransition] = useTransition();
  const { address, connectWallet } = useWalletConnection();

  const refreshProperties = useCallback(async () => {
    if (!address) return;

    startTransition(async () => {
      const result = await fetchUserProperties(address);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.properties) {
        setProperties(result.properties);
      }
    });
  }, [address]);

  useEffect(() => {
    if (address) {
      refreshProperties();
    } else {
      setProperties([]);
    }
  }, [address, refreshProperties]);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-gray-600">Please connect your wallet to view your properties.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Connected Wallet: {address}</p>
        <Button 
          onClick={refreshProperties}
          disabled={isPending}
          variant="outline"
        >
          {isPending ? 'Refreshing...' : 'Refresh Properties'}
        </Button>
      </div>

      {isPending && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {!isPending && properties.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You don't own any properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard 
              key={property.propertyId} 
              property={property}
            />
          ))}
        </div>
      )}
    </div>
  );
}