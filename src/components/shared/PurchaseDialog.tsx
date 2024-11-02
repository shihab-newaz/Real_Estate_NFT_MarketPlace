// components/shared/PurchaseDialog.tsx
import React from 'react';
import { ethers } from 'ethers';
import { PropertyCardProps } from '@/types/property';
import { usePurchaseProperty } from '@/hooks/usePurchaseProperty';
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

interface PurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  property: PropertyCardProps | null;
  onPurchaseComplete: () => void;
}

export function PurchaseDialog({
  isOpen,
  onOpenChange,
  property,
  onPurchaseComplete,
}: PurchaseDialogProps) {
  const { isPurchasing, executePurchase } = usePurchaseProperty(
    property,
    () => {
      onPurchaseComplete();
      onOpenChange(false);
    }
  );

  if (!property) return null;

  const formattedPrice = ethers.formatEther(property.price);

  const handlePurchase = async () => {
    await executePurchase();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to buy this property?
            <br />
            <br />
            Property Details:
            <br />
            Location: {property.location}
            <br />
            Price: {formattedPrice} MATIC
            <br />
            Property Type: {property.propertyType}
            <br />
            Square Footage: {property.squareFootage} sq ft
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPurchasing}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? "Processing..." : "Confirm Purchase"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}