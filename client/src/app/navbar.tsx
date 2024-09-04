'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Wallet, LogOut, Plug } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Navbar() {
  const [account, setAccount] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          setAccount(accounts[0]);
        }
      } else {
        console.log('Make sure you have MetaMask installed!');
      }
    } catch (error) {
      console.error('Error checking if wallet is connected:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        // Reset the connection to force the MetaMask popup
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        });
        
        // Now request the accounts, which will trigger the MetaMask popup
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-900 p-4 shadow-lg">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="font-bold text-xl">RE NFT</span>
        </Link>
      </div>
      <NavigationMenu>
        <NavigationMenuList className="space-x-4">
          <NavigationMenuItem>
            <Link href="/marketplace" legacyBehavior passHref>
              <NavigationMenuLink className={`text-gray-300 hover:text-white ${pathname === '/marketplace' ? 'font-bold' : ''}`}>
                Marketplace
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/create_listing" legacyBehavior passHref>
              <NavigationMenuLink className={`text-gray-300 hover:text-white ${pathname === '/create_listing' ? 'font-bold' : ''}`}>
                Create Listing
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/my_properties" legacyBehavior passHref>
              <NavigationMenuLink className={`text-gray-300 hover:text-white ${pathname === '/my_properties' ? 'font-bold' : ''}`}>
                My Properties
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center space-x-2">
        {account && (
          <Button variant="ghost" className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>{account.slice(2, 4).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-white text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
              {account ? <Plug className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={connectWallet}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>{account ? "Switch Wallet" : "Connect Wallet"}</span>
            </DropdownMenuItem>
            {account && (
              <DropdownMenuItem onClick={disconnectWallet}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}