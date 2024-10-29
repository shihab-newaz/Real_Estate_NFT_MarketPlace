// src/hooks/usePropertyForm.ts
import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NFT_MARKETPLACE_ABI } from "@/utils/contractUtil";

interface FormData {
  name: string;
  description: string;
  propertyType: string;
  propertyImage: string;
  squareFootage: string;
  location: string;
  price: string;
}

export function usePropertyForm(NFT_MARKETPLACE_ADDRESS: string) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    propertyType: "",
    propertyImage: "",
    squareFootage: "",
    location: "",
    price: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);

  // Update the handleInputChange to handle both input and textarea events
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const executeContractTransaction = async (
    tokenURI: string,
    params: any = null
  ) => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install MetaMask");
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

    if (params) {
      // Execute listing transaction
      const tx = await contract.listProperty(
        params.tokenId,
        params.priceInWei,
        params.propertyType,
        params.propertyImage,
        params.squareFootage,
        params.location,
        { value: params.listingFee }
      );
      return tx.wait();
    } else {
      // Execute minting transaction
      const tx = await contract.createToken(tokenURI);
      return tx.wait();
    }
  };

  return {
    formData,
    isLoading,
    isMinting,
    tokenId,
    handleInputChange,
    setIsLoading,
    setIsMinting,
    setTokenId,
    executeContractTransaction,
  };
}
