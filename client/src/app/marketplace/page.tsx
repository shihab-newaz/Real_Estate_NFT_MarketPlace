"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import {Card,CardContent,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } 
from "@/components/ui/alert-dialog";
import { NFT_MARKETPLACE_ABI } from '@/utils/contractUtil';
import { useRouter } from "next/navigation";
import Image from "next/image";

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

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number;}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<bigint | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router=useRouter();
  useEffect(() => {
    connectWallet();
    fetchProperties();
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
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

  const handleBuy = async (propertyId: bigint) => {
    setSelectedPropertyId(propertyId);
    setIsConfirmOpen(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPropertyId) return;
    setIsConfirmOpen(false);
    const toastId = toast.loading("Processing purchase...");
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to use this feature");
      }
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
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

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice
        ? BigInt(Math.floor(Number(feeData.gasPrice) * 1.2))
        : undefined;

      const estimatedGas = await contract.buyProperty.estimateGas(
        selectedPropertyId,
        { value: property.price }
      );
      const gasLimit = BigInt(Math.floor(Number(estimatedGas) * 1.2));
      const tx = await contract.buyProperty(selectedPropertyId, {
        value: property.price,
        gasLimit,
        gasPrice,
      });

      toast.loading("Transaction submitted. Waiting for confirmation...", {
        id: toastId,
      });

      await tx.wait();

      toast.success("Property purchased successfully!", { id: toastId });
      fetchProperties();
    } catch (error) {
      console.error("Error buying property:", error);
      if (error instanceof Error) {
        if ("code" in error) {
          const ethersError = error as ethers.EthersError;
          switch (ethersError.code) {
            case "ACTION_REJECTED":
              toast.error("Transaction was rejected by the user.", {
                id: toastId,
              });
              break;
            case "INSUFFICIENT_FUNDS":
              toast.error(
                "Insufficient funds to complete the purchase. Please check your wallet balance.",
                { id: toastId }
              );
              break;
            default:
              toast.error(`Failed to buy property: ${ethersError.message}`, {
                id: toastId,
              });
          }
        } else {
          toast.error(`Failed to buy property: ${error.message}`, {
            id: toastId,
          });
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          id: toastId,
        });
      }
    }
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
    router.push(`/search?term=${encodeURIComponent(searchTerm)}`);
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
        <h1 className="text-3xl font-bold mb-8">Real Estate NFT Marketplace</h1>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex">
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" className="ml-2">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
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
                        (currentImageIndex[Number(property.propertyId)] % 4) + 1
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
                  Seller: {property.seller.slice(0, 6)}...{property.seller.slice(-4)}
                </p>
              </CardContent>
              <CardFooter>
                {userAddress && userAddress.toLowerCase() === property.seller.toLowerCase() ? (
                  <Button disabled className="w-full">
                    Your Listing
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleBuy(property.propertyId)}
                    className="w-full"
                  >
                    Buy Property
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to buy this property? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPurchase}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}