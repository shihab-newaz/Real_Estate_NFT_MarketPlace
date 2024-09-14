// client\src\app\search\page.tsx
'use client';
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, ReadonlyURLSearchParams } from "next/navigation";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { NFT_MARKETPLACE_ABI } from "@/utils/contractUtil";

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

interface SearchCriteria {
  term: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  minSquareFootage: number;
  maxSquareFootage: number;
  location: string;
}

function SearchParamsWrapper({ children }: { children: (searchParams: ReadonlyURLSearchParams) => React.ReactNode }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}
interface SearchPageContentProps {
  searchParams: ReadonlyURLSearchParams;
}
export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsWrapper>
        {(searchParams) => (
          <SearchPageContent searchParams={searchParams} />
        )}
      </SearchParamsWrapper>
    </Suspense>
  );
}

function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number;}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<bigint | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    term: searchParams?.get("term") || "",
    minPrice: 0,
    maxPrice: 1000,
    propertyType: "all",
    minSquareFootage: 0,
    maxSquareFootage: 10000,
    location: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchCriteria]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const contract = new ethers.Contract(
        NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        provider
      );

      const availableProperties = await contract.fetchAvailableProperties();
      setProperties(availableProperties);

      const initialImageIndices = availableProperties.reduce(
        (acc: { [key: number]: number }, property: Property) => {
          acc[Number(property.propertyId)] = 0;
          return acc;
        },
        {}
      );
      setCurrentImageIndex(initialImageIndices);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to fetch properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = useCallback(() => {
    const filtered = properties.filter((property) => {
      const price = Number(ethers.formatEther(property.price));
      const squareFootage = Number(property.squareFootage);
      
      return (
        (searchCriteria.term === "" || 
         property.location.toLowerCase().includes(searchCriteria.term.toLowerCase()) ||
         property.propertyType.toLowerCase().includes(searchCriteria.term.toLowerCase())) &&
        price >= searchCriteria.minPrice &&
        price <= searchCriteria.maxPrice &&
        (searchCriteria.propertyType === "all" || property.propertyType === searchCriteria.propertyType) &&
        squareFootage >= searchCriteria.minSquareFootage &&
        squareFootage <= searchCriteria.maxSquareFootage &&
        (searchCriteria.location === "" || property.location.toLowerCase().includes(searchCriteria.location.toLowerCase()))
      );
    });
    setFilteredProperties(filtered);
  }, [properties, searchCriteria]);

  const handleSearchCriteriaChange = (field: keyof SearchCriteria, value: string | number) => {
    setSearchCriteria((prev) => ({ ...prev, [field]: value }));
  };

  const changeImage = (propertyId: bigint, direction: "next" | "prev") => {
    setCurrentImageIndex((prevIndices) => {
      const currentIndex = prevIndices[Number(propertyId)] || 0;
      const totalImages = 4;
      let newIndex;

      if (direction === "next") {
        newIndex = (currentIndex + 1) % totalImages;
      } else {
        newIndex = (currentIndex - 1 + totalImages) % totalImages;
      }

      return { ...prevIndices, [Number(propertyId)]: newIndex };
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterProperties();
  };

  const handleBuy = (propertyId: bigint) => {
    setSelectedPropertyId(propertyId);
    setIsConfirmOpen(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPropertyId) return;
    setIsConfirmOpen(false);
    const toastId = toast.loading("Processing purchase...");
    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        signer
      );

      const property = properties.find(
        (p) => p.propertyId === selectedPropertyId
      );
      if (!property) {
        throw new Error("Property not found");
      }

      const tx = await contract.buyProperty(selectedPropertyId, {
        value: property.price,
      });

      toast.loading("Transaction submitted. Waiting for confirmation...", {
        id: toastId,
      });

      await tx.wait();

      toast.success("Property purchased successfully!", { id: toastId });
      fetchProperties(); // Refresh the properties list
    } catch (error) {
      console.error("Error buying property:", error);
      toast.error("Failed to buy property. Please try again.", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Properties</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="term">Search Term</Label>
                <Input
                  id="term"
                  value={searchCriteria.term}
                  onChange={(e) => handleSearchCriteriaChange("term", e.target.value)}
                  placeholder="Enter keywords..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPrice">Min Price (MATIC)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={searchCriteria.minPrice}
                    onChange={(e) => handleSearchCriteriaChange("minPrice", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price (MATIC)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={searchCriteria.maxPrice}
                    onChange={(e) => handleSearchCriteriaChange("maxPrice", Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={searchCriteria.propertyType}
                  onValueChange={(value) => handleSearchCriteriaChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minSquareFootage">Min Square Footage</Label>
                  <Input
                    id="minSquareFootage"
                    type="number"
                    value={searchCriteria.minSquareFootage}
                    onChange={(e) => handleSearchCriteriaChange("minSquareFootage", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSquareFootage">Max Square Footage</Label>
                  <Input
                    id="maxSquareFootage"
                    type="number"
                    value={searchCriteria.maxSquareFootage}
                    onChange={(e) => handleSearchCriteriaChange("maxSquareFootage", Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={searchCriteria.location}
                  onChange={(e) => handleSearchCriteriaChange("location", e.target.value)}
                  placeholder="Enter city or state"
                />
              </div>
              <Button type="submit" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.propertyId.toString()} className="w-full">
              <CardHeader>
                <CardTitle>{property.propertyType}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-w-16 aspect-h-9 mb-4">
                  <Image
                    src={
                      property.propertyImage ||
                      `/placeholder${
                        (currentImageIndex[Number(property.propertyId)] % 4) +
                        1
                      }.jpg`
                    }
                    alt={`Property ${property.propertyId}`}
                    width={400}
                    height={225}
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={() => changeImage(property.propertyId, "prev")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => changeImage(property.propertyId, "next")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-lg font-semibold">
                  {ethers.formatEther(property.price)} MATIC
                </p>
                <p>{property.squareFootage.toString()} sq ft</p>
                <p>{property.location}</p>
                <p className="text-sm text-gray-500">
                  Seller: {property.seller.slice(0, 6)}...
                  {property.seller.slice(-4)}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleBuy(property.propertyId)}
                  className="w-full"
                >
                  Buy Property
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {filteredProperties.length === 0 && (
          <p className="text-center mt-8">No properties match your search criteria.</p>
        )}
      </main>
  
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to buy this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPurchase}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}