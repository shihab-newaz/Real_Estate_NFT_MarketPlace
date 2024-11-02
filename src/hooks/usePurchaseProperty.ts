// hooks/usePurchaseProperty.ts
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { NFT_MARKETPLACE_ABI, NFT_MARKETPLACE_ADDRESS } from '@/utils/contractUtil';
import { PropertyCardProps } from '@/types/property';

export function usePurchaseProperty(
  property: PropertyCardProps | null,
  onSuccess?: () => void
) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { address } = useWalletConnection();

  const handlePurchaseError = useCallback((error: unknown, toastId: string) => {
    if (error instanceof Error) {
      if ("code" in error) {
        const ethersError = error as ethers.EthersError;
        switch (ethersError.code) {
          case "ACTION_REJECTED":
            toast.error("Transaction was rejected by the user.", { id: toastId });
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
        toast.error(`Failed to buy property: ${error.message}`, { id: toastId });
      }
    } else {
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
    }
  }, []);

  const executePurchase = useCallback(async () => {
    if (!address || !property) {
      toast.error("Cannot process purchase at this time.");
      return;
    }
    
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
      onSuccess?.();
    } catch (error) {
      console.error("Error buying property:", error);
      handlePurchaseError(error, toastId);
    } finally {
      setIsPurchasing(false);
    }
  }, [address, property, handlePurchaseError, onSuccess]);

  return {
    isPurchasing,
    executePurchase,
  };
}