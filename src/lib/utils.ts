import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// lib/utils.ts
import { ethers } from "ethers";

export const ZERO_BIGINT = BigInt(0);
export const ONE_BIGINT = BigInt(1);

export function formatAddress(address: string, chars = 4): string {
  try {
    const checksumAddress = ethers.getAddress(address);
    return `${checksumAddress.slice(0, chars + 2)}...${checksumAddress.slice(
      -chars
    )}`;
  } catch (error) {
    console.error("Error formatting address:", error);
    return "Invalid Address";
  }
}

export function formatPrice(priceString: string): string {
  try {
    const priceBigInt = BigInt(priceString);
    const formattedPrice = ethers.formatEther(priceBigInt);
    // Format to max 4 decimal places
    const [whole, decimal] = formattedPrice.split(".");
    const truncatedDecimal = decimal ? decimal.slice(0, 4) : "0";
    return `${whole}.${truncatedDecimal} MATIC`;
  } catch (error) {
    console.error("Error formatting price:", error);
    return "Price not available";
  }
}

export function toBigInt(value: string | number | bigint | undefined): bigint {
  if (value === undefined) return ZERO_BIGINT;
  try {
    return BigInt(value.toString());
  } catch {
    return ZERO_BIGINT;
  }
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
