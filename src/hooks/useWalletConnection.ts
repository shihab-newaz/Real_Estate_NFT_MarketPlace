// Custom hook for managing wallet connections and account data
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Type definitions for account data
export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

// Type definition for Ethereum provider (MetaMask)
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}

export function useWalletConnection() {
  // State for storing wallet address and account data
  const [address, setAddress] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountType>({});

  // Function to update wallet data in the backend and state
  const updateWalletData = useCallback(async (newAddress: string) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const balance = await provider.getBalance(newAddress);
        const network = await provider.getNetwork();

        const newAccountData = {
          address: newAddress,
          balance: ethers.formatEther(balance),
          chainId: network.chainId.toString(),
          network: network.name,
        };

        await fetch("/api/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAccountData),
        });

        setAccountData(newAccountData);
      } catch (error) {
        console.error("Failed to update wallet data:", error);
      }
    }
  }, []); // No dependencies as it only uses external APIs

  // Function to disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (address) {
      await fetch("/api/wallet", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
    }
    setAddress(null);
    setAccountData({});
    localStorage.removeItem("walletAddress");
  }, [address]); // Depends on address state

  // Function to handle account changes from MetaMask
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
      const newAddress = accounts[0];
      setAddress(newAddress);
      localStorage.setItem("walletAddress", newAddress);
      await updateWalletData(newAddress);
    } else {
      await disconnectWallet();
    }
  }, [updateWalletData, disconnectWallet]); // Include all dependencies

  // Function to check initial wallet connection
  const checkWalletConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const currentAddress = await accounts[0].getAddress();
          const response = await fetch(`/api/wallet?address=${currentAddress}`);
          const data = await response.json();
          if (data.connected === "true") {
            setAddress(currentAddress);
            setAccountData(data);
          }
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }
  }, []); // No dependencies as it only uses external APIs

  // Effect to load saved wallet address from localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []); // Runs once on mount

  // Effect to set up wallet connection and event listeners
  useEffect(() => {
    checkWalletConnection();
    const ethereum = window.ethereum as EthereumProvider | undefined;
    
    // Set up event listener for account changes
    if (ethereum?.on) {
      ethereum.on("accountsChanged", (accounts: unknown) => {
        handleAccountsChanged(accounts as string[]);
      });
    }

    // Cleanup function to remove event listener
    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged as any
        );
      }
    };
  }, [checkWalletConnection, handleAccountsChanged]); // Include all dependencies

  // Function to connect wallet
  const connectWallet = async () => {
    const ethereum = window.ethereum as EthereumProvider | undefined;
    if (ethereum?.request) {
      try {
        // Request wallet permissions
        await ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        // Request accounts (triggers MetaMask modal)
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        if (accounts && accounts.length > 0) {
          const newAddress = accounts[0];
          setAddress(newAddress);
          await updateWalletData(newAddress);
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.error(
        "Ethereum object not found, do you have MetaMask installed?"
      );
    }
  };

  // Function to change account
  const changeAccount = async () => {
    const ethereum = window.ethereum as EthereumProvider | undefined;
    if (ethereum?.request) {
      try {
        // Force MetaMask to show the account selection modal
        await ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });

        // After permission is granted, request accounts again
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        if (accounts && accounts[0] !== address) {
          const newAddress = accounts[0];
          setAddress(newAddress);
          await updateWalletData(newAddress);
        }
      } catch (error) {
        console.error("Failed to change account:", error);
      }
    } else {
      console.error(
        "Ethereum object not found, do you have MetaMask installed?"
      );
    }
  };

  // Return hook values and functions
  return {
    address,
    accountData,
    connectWallet,
    disconnectWallet,
    changeAccount,
  };
}