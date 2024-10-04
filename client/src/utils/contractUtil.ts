// src/utils/contractUtils.ts
import NFTMarketplaceArtifact from './contracts/NFTMarketplace.sol/NFTMarketplace.json';
export const NFT_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
export const NFT_MARKETPLACE_ABI = NFTMarketplaceArtifact.abi;