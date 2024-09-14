"use client";
import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { NFT_MARKETPLACE_ABI } from '@/utils/contractUtil';
import { useWalletConnection } from '@/hooks/useWalletConnection';

const NFT_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

interface FormData {
  tokenURI: string;
  price: string;
  propertyType: string;
  propertyImage: string;
  squareFootage: string;
  location: string;
}

const ListPropertyForm: React.FC = () => {
  const router = useRouter();
  const { address, connectWallet } = useWalletConnection();
  const [formData, setFormData] = useState<FormData>({
    tokenURI: "",
    price: "",
    propertyType: "",
    propertyImage: "",
    squareFootage: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const mintToken = useCallback(async () => {
    setIsMinting(true);
    let retries = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    const attemptMint = async (): Promise<void> => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('Please install MetaMask to use this feature');
        }

        if (!NFT_MARKETPLACE_ADDRESS) {
          throw new Error('Contract address not configured');
        }

        const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

        console.log('Attempting to mint token with URI:', formData.tokenURI);

        const feeData = await provider.getFeeData();
        const adjustedGasPrice = feeData.gasPrice ? 
          BigInt(Math.floor(Number(feeData.gasPrice) * 1.2)) : 
          undefined;

        const estimatedGas = await contract.createToken.estimateGas(formData.tokenURI);
        const gasLimit = BigInt(Math.floor(Number(estimatedGas) * 1.5));

        const tx = await contract.createToken(formData.tokenURI, { 
          gasLimit,
          gasPrice: adjustedGasPrice
        });

        const receipt = await tx.wait();

        const transferEvent = receipt.logs.find(
          (log: any) => log.topics[0] === ethers.id("Transfer(address,address,uint256)")
        );

        if (transferEvent) {
          const tokenIdBigInt = BigInt(transferEvent.topics[3]);
          setTokenId(tokenIdBigInt);
          toast.success('Token minted successfully!');
        } else {
          throw new Error('Token ID not found in transaction receipt');
        }
      } catch (error) {
        console.error('Detailed error:', error);
        
        if (error instanceof Error) {
          if ('code' in error) {
            const ethersError = error as ethers.EthersError;
            switch(ethersError.code) {
              case 'ACTION_REJECTED':
                toast.error('Transaction was rejected by the user.');
                break;
              case 'INSUFFICIENT_FUNDS':
                toast.error('Insufficient funds to complete the transaction. Please check your wallet balance.');
                break;
              case 'NETWORK_ERROR':
                if (retries < MAX_RETRIES) {
                  retries++;
                  console.log(`Network error. Retrying (${retries}/${MAX_RETRIES})...`);
                  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                  return attemptMint();
                } else {
                  toast.error('Network error. Max retries reached. Please try again later.');
                }
                break;
              default:
                if (retries < MAX_RETRIES) {
                  retries++;
                  console.log(`Unknown error. Retrying (${retries}/${MAX_RETRIES})...`);
                  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                  return attemptMint();
                } else {
                  toast.error(`Ethereum error: ${ethersError.message}`);
                }
            }
          } else {
            toast.error(`Error: ${error.message}`);
          }
        } else {
          toast.error('An unknown error occurred. Please check the console and try again.');
        }
      } finally {
        setIsMinting(false);
      }
    };

    await attemptMint();
  }, [formData.tokenURI]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

      const listingFee = await contract.getListingFee();
      const priceInWei = ethers.parseEther(formData.price);

      if (tokenId === null) {
        throw new Error("Token has not been minted yet");
      }

      const transactionParameters = [
        tokenId,
        priceInWei,
        formData.propertyType,
        formData.propertyImage,
        BigInt(formData.squareFootage),
        formData.location,
      ];

      const gasLimit = BigInt(500000);
      const gasPriceGwei = BigInt(50);
      const gasPrice = gasPriceGwei * BigInt(1e9);

      const balance = await provider.getBalance(signer.getAddress());
      const estimatedCost = gasLimit * gasPrice + listingFee;

      if (balance < estimatedCost) {
        throw new Error("Insufficient funds to cover gas and listing fee");
      }

      const tx = await contract.listProperty(...transactionParameters, {
        value: listingFee,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      });

      await tx.wait();

      toast.success("Property listed successfully!");
      router.push("/marketplace");
    } catch (error: unknown) {
      console.error("Detailed error:", error);

      if (error instanceof Error) {
        if ("code" in error) {
          const ethersError = error as ethers.EthersError;
          switch (ethersError.code) {
            case "ACTION_REJECTED":
              toast.error("Transaction was rejected by the user.");
              break;
            case "INSUFFICIENT_FUNDS":
              toast.error("Insufficient MATIC to complete the transaction. Make sure you have enough MATIC to cover the listing fee and gas.");
              break;
            default:
              toast.error(`Ethereum error: ${ethersError.message}`);
          }
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error("An unknown error occurred. Please check the console and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, tokenId, router]);

  useEffect(() => {
    if (address) {
      setNetworkError(null);
    } else {
      setNetworkError("Please connect your wallet to list a property.");
    }
  }, [address]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>List Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          {networkError && <p className="text-red-500 mb-4">{networkError}</p>}
          {!address ? (
            <div className="text-center">
              <p className="mb-4">Please connect your wallet to list a property.</p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </div>
          ) : NFT_MARKETPLACE_ADDRESS ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tokenURI">Token URI</Label>
                  <Input
                    id="tokenURI"
                    name="tokenURI"
                    value={formData.tokenURI}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={mintToken}
                  disabled={isMinting || !!tokenId}
                >
                  {isMinting ? "Minting..." : tokenId ? "Token Minted" : "Mint Token"}
                </Button>
                {tokenId && <p>Token ID: {tokenId.toString()}</p>}
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
                  <Label htmlFor="propertyImage">Property Image URL</Label>
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
                    type="number"
                    value={formData.squareFootage}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
              </div>
              <div className="mt-6">
                <Button type="submit" disabled={isLoading || !tokenId}>
                  {isLoading ? "Listing..." : "List Property"}
                </Button>
              </div>
            </form>
          ) : (
            <p>Loading contract address... If this persists, please check your configuration.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListPropertyForm;