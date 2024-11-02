// app/marketplace/components/BuyButton.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { toast } from "react-hot-toast";
import { PropertyCardProps } from '@/types/property';
import { PurchaseDialog } from '@/components/shared/PurchaseDialog';
import { usePurchaseProperty } from '@/hooks/usePurchaseProperty';

interface BuyButtonProps {
  property: PropertyCardProps;
  onPropertyBought: () => void;
}

export function BuyButton({ property, onPropertyBought }: BuyButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { address, connectWallet } = useWalletConnection();
  const { isPurchasing } = usePurchaseProperty(property, onPropertyBought);

  const handleBuy = useCallback(() => {
    if (!address) {
      toast.error("Please connect your wallet to buy properties");
      return;
    }
    setIsConfirmOpen(true);
  }, [address]);

  const isSellerProperty = useMemo(
    () =>
      address &&
      property.seller &&
      address.toLowerCase() === property.seller.toLowerCase(),
    [address, property.seller]
  );

  if (!address) {
    return (
      <Button onClick={connectWallet} className="w-full">
        Connect Wallet to Buy
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleBuy}
        className="w-full"
        disabled={isSellerProperty || isPurchasing}
      >
        {isPurchasing ? (
          <BeatLoader size={8} color="#ffffff" />
        ) : isSellerProperty ? (
          "Your Listing"
        ) : (
          "Buy Property"
        )}
      </Button>

      <PurchaseDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        property={property}
        onPurchaseComplete={onPropertyBought}
      />
    </>
  );
}