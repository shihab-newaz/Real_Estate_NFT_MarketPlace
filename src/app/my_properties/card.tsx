// src/components/property/PropertyCard.tsx
import { useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Maximize2, 
  Tag, 
  Building2, 
  Hash,
  Share2
} from 'lucide-react';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const formatPrice = (price: bigint) => {
    try {
      return `${parseFloat(ethers.formatEther(price)).toFixed(2)} MATIC`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'Price error';
    }
  };

  const handleShareProperty = async () => {
    try {
      const propertyUrl = `${window.location.origin}/property/${property.propertyId}`;
      await navigator.clipboard.writeText(propertyUrl);
      toast.success('Property link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy property link');
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="relative pb-0">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {property.sold && (
              <Badge variant="destructive">
                Sold
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {property.propertyType}
            </Badge>
          </div>
          <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={property.propertyImage || '/property(2).png'}
              alt={`Property ${property.propertyId}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button 
              onClick={() => setIsDetailsOpen(true)}
              className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full 
                       hover:bg-white transition-colors duration-200"
            >
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">
                {formatPrice(property.price)}
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {property.location}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleShareProperty}
              title="Share property"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-gray-500">
              <Building2 className="w-4 h-4 mr-1" />
              {property.squareFootage} sq ft
            </div>
            <div className="flex items-center text-gray-500">
              <Hash className="w-4 h-4 mr-1" />
              Token ID: {property.tokenId}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative w-full aspect-video overflow-hidden rounded-lg">
              <Image
                src={property.propertyImage || '/property(2).png'}
                alt={`Property ${property.propertyId}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Price</h3>
                <p className="text-lg">{formatPrice(property.price)}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Property Type</h3>
                <p className="capitalize">{property.propertyType}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Location</h3>
                <p>{property.location}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Square Footage</h3>
                <p>{property.squareFootage} sq ft</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Token ID</h3>
                <p>{property.tokenId}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Status</h3>
                <p>{property.sold ? 'Sold' : 'Available'}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Owner</h3>
                <p className="truncate" title={property.owner}>
                  {property.owner}
                </p>
              </div>

              {property.seller && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Seller</h3>
                  <p className="truncate" title={property.seller}>
                    {property.seller}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

