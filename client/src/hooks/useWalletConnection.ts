import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}

export function useWalletConnection() {
  const [address, setAddress] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountType>({});

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);
  
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
  }, []);

  useEffect(() => {
    checkWalletConnection();
    const ethereum = window.ethereum as EthereumProvider | undefined;
    if (ethereum?.on) {
      ethereum.on("accountsChanged", (accounts: unknown) => {
        handleAccountsChanged(accounts as string[]);
      });
    }
    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged as any
        );
      }
    };
  }, [checkWalletConnection]);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
      const newAddress = accounts[0];
      setAddress(newAddress);
      localStorage.setItem("walletAddress", newAddress);
      await updateWalletData(newAddress);
    } else {
      await disconnectWallet();
    }
  }, []);

  const updateWalletData = async (newAddress: string) => {
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
  };

  const connectWallet = async () => {
    const ethereum = window.ethereum as EthereumProvider | undefined;
    if (ethereum?.request) {
      try {
        await ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        // This will trigger the MetaMask modal
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

  const disconnectWallet = async () => {
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
  };

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

  return {
    address,
    accountData,
    connectWallet,
    disconnectWallet,
    changeAccount,
  };
}