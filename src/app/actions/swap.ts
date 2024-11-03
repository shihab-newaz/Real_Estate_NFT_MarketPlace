// app/swap/actions.ts
'use server'

import { ethers } from 'ethers';
import { MATIC_SWAP_ADDRESS } from '@/constants';
import { revalidatePath } from 'next/cache';

const MATIC_SWAP_ABI = [
  'function getEstimatedMaticOutput(address tokenIn, uint256 amountIn) external view returns (uint256)',
  'function swapTokenForMatic(address tokenIn, uint256 amountIn, uint256 minAmountOut) external returns (uint256)',
];

export async function getEstimatedOutput(tokenAddress: string, amountIn: string) {
  try {
    if (!process.env.NEXT_PUBLIC_RPC_URL) {
      throw new Error('RPC URL not configured');
    }

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(MATIC_SWAP_ADDRESS, MATIC_SWAP_ABI, provider);

    const amountInWei = ethers.parseUnits(amountIn, 18); // Assuming 18 decimals, adjust if needed
    const estimatedOutput = await contract.getEstimatedMaticOutput(tokenAddress, amountInWei);

    return {
      success: true,
      amount: ethers.formatEther(estimatedOutput),
    };
  } catch (error) {
    console.error('Error getting estimated output:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get estimate',
    };
  }
}

export async function executeSwap(
  tokenAddress: string,
  amountIn: string,
  minAmountOut: string,
  slippageTolerance: number
) {
  try {
    if (!process.env.NEXT_PUBLIC_RPC_URL) {
      throw new Error('RPC URL not configured');
    }

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(MATIC_SWAP_ADDRESS, MATIC_SWAP_ABI, provider);

    const amountInWei = ethers.parseUnits(amountIn, 18);
    const minAmountOutWei = ethers.parseUnits(minAmountOut, 18);

    // Calculate minimum amount with slippage
    const minAmountWithSlippage = minAmountOutWei * BigInt(Math.floor((100 - slippageTolerance) * 100)) / BigInt(10000);

    // Get swap parameters
    const swapParams = {
      tokenIn: tokenAddress,
      amountIn: amountInWei,
      minAmountOut: minAmountWithSlippage,
    };

    // Return the parameters for the client to execute the transaction
    revalidatePath('/swap');
    return {
      success: true,
      params: swapParams,
    };
  } catch (error) {
    console.error('Error preparing swap:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prepare swap',
    };
  }
}