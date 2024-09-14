'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Wallet, LogOut, Plug, Menu, X, Loader2 } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    setIsWalletLoading(true);
    try {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Refresh the router and then reload the page
        router.refresh();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsWalletLoading(true);
    setAccount(null);
    
    // Refresh the router and then reload the page
    router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    setIsWalletLoading(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavItems = () => (
    <>
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
    </>
  );

  return (
    <nav className="bg-gray-900 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-white">
            <Home className="h-6 w-6" />
            <span className="font-bold text-xl">RE NFT</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList className="space-x-4">
                <NavItems />
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center space-x-2">
              {account && (
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-500">
                  <Avatar>
                    <AvatarFallback>{account.slice(2, 4).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm hidden lg:inline">
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
                  <DropdownMenuItem onClick={connectWallet} disabled={isWalletLoading}>
                    {isWalletLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>{account ? "Switch Wallet" : "Connect Wallet"}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  {account && (
                    <DropdownMenuItem onClick={disconnectWallet} disabled={isWalletLoading}>
                      {isWalletLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Disconnecting...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Disconnect</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-col space-y-2">
                <NavItems />
              </NavigationMenuList>
            </NavigationMenu>
            <div className="mt-4 flex flex-col space-y-2">
              {account && (
                <Button variant="ghost" className="flex items-center justify-center space-x-2 hover:bg-gray-500">
                  <Avatar>
                    <AvatarFallback>{account.slice(2, 4).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </Button>
              )}
              <Button 
                onClick={account ? disconnectWallet : connectWallet} 
                className="bg-gray-800 text-white hover:bg-gray-700"
                disabled={isWalletLoading}
              >
                {isWalletLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {account ? "Disconnecting..." : "Connecting..."}
                  </>
                ) : (
                  account ? "Disconnect Wallet" : "Connect Wallet"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}