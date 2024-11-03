// src/utils/contractUtils.ts
import { ethers } from "ethers";
import NFTMarketplaceArtifact from "@/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export const NFT_MARKETPLACE_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as string;
export const NFT_MARKETPLACE_ABI = NFTMarketplaceArtifact.abi;
export const SUPPORTED_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "80002"; // Mumbai testnet by default
export const SUPPORTED_NETWORK = process.env.NEXT_PUBLIC_NETWORK || "amoy";

// Validate contract configuration
if (!NFT_MARKETPLACE_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_CONTRACT_ADDRESS is not configured in environment variables"
  );
}

if (!NFT_MARKETPLACE_ABI) {
  throw new Error("NFT Marketplace ABI is not properly loaded");
}

// Get contract instance
export const getContractInstance = async (
  provider: ethers.Provider,
  withSigner = false
) => {
  try {
    // Verify network
    const network = await provider.getNetwork();
    if (network.chainId.toString() !== SUPPORTED_CHAIN_ID) {
      throw new Error(`Please connect to ${SUPPORTED_NETWORK} network`);
    }

    // Verify contract exists
    const code = await provider.getCode(NFT_MARKETPLACE_ADDRESS);
    if (code === "0x") {
      throw new Error(
        `Contract not deployed at address: ${NFT_MARKETPLACE_ADDRESS}`
      );
    }

    if (withSigner) {
      if (!window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(
        NFT_MARKETPLACE_ADDRESS,
        NFT_MARKETPLACE_ABI,
        signer
      );
    }

    return new ethers.Contract(
      NFT_MARKETPLACE_ADDRESS,
      NFT_MARKETPLACE_ABI,
      provider
    );
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw error;
  }
};