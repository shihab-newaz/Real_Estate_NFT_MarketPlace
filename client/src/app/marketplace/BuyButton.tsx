// app/marketplace/BuyButton.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import {
  NFT_MARKETPLACE_ABI,
  NFT_MARKETPLACE_ADDRESS,
} from "@/utils/contractUtil";
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
import { BeatLoader } from "react-spinners";

interface PropertyProps {
  propertyId: string;
  tokenId: string;
  seller: string;
  owner: string;
  price: string;
  sold: boolean;
  propertyType: string;
  propertyImage: string;
  squareFootage: string;
  location: string;
}
interface BuyButtonProps {
  property: PropertyProps;
  onPropertyBought: () => void;
}
export function BuyButton({ property, onPropertyBought }: BuyButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { address, connectWallet } = useWalletConnection();

  const handleBuy = useCallback(() => {
    if (!address) {
      toast.error("Please connect your wallet to buy properties");
      return;
    }
    setIsConfirmOpen(true);
  }, [address]);

  const confirmPurchase = useCallback(async () => {
    if (!address) return;
    setIsConfirmOpen(false);
    setIsPurchasing(true);
    const toastId = toast.loading("Processing purchase...");

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

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice
        ? BigInt(Math.floor(Number(feeData.gasPrice) * 1.2))
        : undefined;

      const propertyPrice = BigInt(property.price);
      const estimatedGas = await contract.buyProperty.estimateGas(
        property.propertyId,
        { value: propertyPrice }
      );
      const gasLimit = BigInt(Math.floor(Number(estimatedGas) * 1.2));

      const tx = await contract.buyProperty(property.propertyId, {
        value: propertyPrice,
        gasLimit,
        gasPrice,
      });

      toast.loading("Transaction submitted. Waiting for confirmation...", {
        id: toastId,
      });

      await tx.wait();
      toast.success("Property purchased successfully!", { id: toastId });
    } catch (error) {
      console.error("Error buying property:", error);
      handlePurchaseError(error, toastId);
    } finally {
      setIsPurchasing(false);
    }
  },  [address, property.propertyId, property.price, onPropertyBought]);

  const handlePurchaseError = (error: unknown, toastId: string) => {
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
  };

  const isSellerProperty = useMemo(
    () =>
      address &&
      property.seller &&
      address.toLowerCase() === property.seller.toLowerCase(),
    [address, property.seller]
  );

  const formattedPrice = useMemo(
    () => ethers.formatEther(property.price),
    [property.price]
  );

  return (
    <div className="w-full">
      <Button
        onClick={handleBuy}
        className="w-full"
        disabled={isSellerProperty || !address || isPurchasing}
      >
        {isPurchasing ? (
          <BeatLoader size={8} color="#ffffff" />
        ) : isSellerProperty ? (
          "Your Listing"
        ) : (
          "Buy Property"
        )}
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to buy this property?
              <br />
              Property Details:
              <br />
              Location: {property.location}
              <br />
              Price: {formattedPrice} MATIC
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPurchase}>
              Confirm Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
