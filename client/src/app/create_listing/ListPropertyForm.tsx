// src/app/create_listing/ListPropertyForm.tsx
"use client";
import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { NFT_MARKETPLACE_ABI } from "@/utils/contractUtil";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { uploadToIPFS } from "@/utils/ipfsUtil";

interface ListPropertyFormProps {
  NFT_MARKETPLACE_ADDRESS: string;
}

interface FormData {
  name: string;
  description: string;
  propertyType: string;
  propertyImage: string;
  squareFootage: string;
  location: string;
  price: string;
}

export const ListPropertyForm: React.FC<ListPropertyFormProps> = ({
  NFT_MARKETPLACE_ADDRESS,
}) => {
  const router = useRouter();
  const { address, connectWallet } = useWalletConnection();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    propertyType: "",
    propertyImage: "",
    squareFootage: "",
    location: "",
    price: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const mintToken = useCallback(async () => {
    setIsMinting(true);
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to use this feature");
      }

      // Prepare metadata for IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: formData.propertyImage,
        price: formData.price,
        attributes: [
          { trait_type: "Property Type", value: formData.propertyType },
          { trait_type: "Square Footage", value: formData.squareFootage },
          { trait_type: "Location", value: formData.location },
        ],
      };

      // Upload metadata to IPFS
      const ipfsHash = await uploadToIPFS(metadata);
      const tokenURI = `https://ipfs.io/ipfs/${ipfsHash}`;

      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        signer
      );

      // Estimate gas
      const estimatedGas = await contract.createToken.estimateGas(tokenURI);

      // Add a 20% buffer to the estimated gas
      const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);

      // Get current fee data
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      if (!gasPrice) {
        throw new Error("Failed to get current gas price");
      }

      const tx = await contract.createToken(tokenURI, {
        gasLimit,
        gasPrice,
      });

      const receipt = await tx.wait();

      const transferEvent = receipt.logs.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );

      if (transferEvent) {
        const tokenIdBigInt = BigInt(transferEvent.topics[3]);
        setTokenId(tokenIdBigInt);
        toast.success("Token minted successfully!");
      } else {
        throw new Error("Token ID not found in transaction receipt");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds to mint the token. Please check your wallet balance.");
        } else if (error.message.includes("user rejected transaction")) {
          toast.error("Transaction was rejected. Please try again.");
        } else if (error.message.includes("network changed")) {
          toast.error("Network changed during the transaction. Please ensure you're on the correct network and try again.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error(
          "An unknown error occurred. Please check the console and try again."
        );
      }
    } finally {
      setIsMinting(false);
    }
  }, [formData, NFT_MARKETPLACE_ADDRESS]);

  const handleListProperty = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (typeof window.ethereum === "undefined") {
          throw new Error("Please install MetaMask to use this feature");
        }

        const provider = new ethers.BrowserProvider(
          window.ethereum as ethers.Eip1193Provider
        );
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          NFT_MARKETPLACE_ADDRESS,
          NFT_MARKETPLACE_ABI,
          signer
        );

        const listingFee = await contract.getListingFee();
        const priceInWei = ethers.parseEther(formData.price);

        if (tokenId === null) {
          throw new Error("Token has not been minted yet");
        }

        // Estimate gas
        const estimatedGas = await contract.listProperty.estimateGas(
          tokenId,
          priceInWei,
          formData.propertyType,
          formData.propertyImage,
          BigInt(formData.squareFootage),
          formData.location,
          { value: listingFee }
        );

        // Add a 20% buffer to the estimated gas
        const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);

        const tx = await contract.listProperty(
          tokenId,
          priceInWei,
          formData.propertyType,
          formData.propertyImage,
          BigInt(formData.squareFootage),
          formData.location,
          { 
            value: listingFee,
            gasLimit 
          }
        );

        await tx.wait();

        toast.success("Property listed successfully!");
        router.push("/marketplace");
      } catch (error: unknown) {
        console.error("Detailed error:", error);
        if (error instanceof Error) {
          if (error.message.includes("insufficient funds")) {
            toast.error("Insufficient funds to complete the transaction. Please check your wallet balance.");
          } else if (error.message.includes("user rejected transaction")) {
            toast.error("Transaction was rejected. Please try again.");
          } else {
            toast.error(`Error: ${error.message}`);
          }
        } else {
          toast.error(
            "An unknown error occurred. Please check the console and try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, tokenId, router, NFT_MARKETPLACE_ADDRESS]
  );

  if (!address) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>List Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4">
              Please connect your wallet to list a property.
            </p>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>List Your Property</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleListProperty}>
          <div className="space-y-4">
            {/* Add form fields for name, description, etc. */}
            <div>
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Add other form fields similarly */}
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Input
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                
              />
            </div>
            <div>
              <Label htmlFor="propertyImage">Image URL</Label>
              <Input
                id="propertyImage"
                name="propertyImage"
                value={formData.propertyImage}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="squareFootage">Square Footage</Label>
              <Input
                id="squareFootage"
                name="squareFootage"
                value={formData.squareFootage}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price (MATIC)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.000000000000000001"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

          </div>
          <div className="mt-6">
            <Button
              type="button"
              onClick={mintToken}
              disabled={isMinting || !!tokenId}
            >
              {isMinting
                ? "Minting..."
                : tokenId
                ? "Token Minted"
                : "Mint Token"}
            </Button>
          </div>
          {tokenId && <p className="mt-2">Token ID: {tokenId.toString()}</p>}
          <div className="mt-6">
            <Button type="submit" disabled={isLoading || !tokenId}>
              {isLoading ? "Listing..." : "List Property"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
