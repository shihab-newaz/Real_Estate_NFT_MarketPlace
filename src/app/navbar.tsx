// src\app\navbar.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Wallet, LogOut, Plug, Menu, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWalletConnection } from '@/hooks/useWalletConnection';

export default function Navbar() {
    const { address, connectWallet, disconnectWallet, changeAccount } = useWalletConnection();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // useEffect(() => {
    //     console.log("Address:", address);
    // }, [address]);

    const handleConnectWallet = async () => {
        await connectWallet();
    };

    const handleDisconnectWallet = async () => {
        await disconnectWallet();
    };

    const handleChangeAccount = async () => {
        await changeAccount();
    };

    const NavItems = () => (
        <>
            <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={`text-gray-300 hover:text-white ${pathname === '/' ? 'font-bold' : ''}`}>
                        Home
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
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
                            {address && (
                                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-700" onClick={handleChangeAccount}>
                                    <Avatar>
                                        <AvatarFallback>{address.slice(2, 4).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-white text-sm hidden lg:inline">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </span>
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
                                        {address ? <Plug className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {address ? (
                                        <>
                                            <DropdownMenuItem onClick={handleChangeAccount}>
                                                <Wallet className="mr-2 h-4 w-4" />
                                                <span>Change Account</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleDisconnectWallet}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Disconnect</span>
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem onClick={handleConnectWallet}>
                                            <Wallet className="mr-2 h-4 w-4" />
                                            <span>Connect Wallet</span>
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
                            {address && (
                                <Button variant="ghost" className="flex items-center justify-center space-x-2 hover:bg-gray-700" onClick={handleChangeAccount}>
                                    <Avatar>
                                        <AvatarFallback>{address.slice(2, 4).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-white text-sm">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </span>
                                </Button>
                            )}
                            <Button 
                                onClick={address ? handleDisconnectWallet : handleConnectWallet} 
                                className="bg-gray-800 text-white hover:bg-gray-700"
                            >
                                {address ? "Disconnect Wallet" : "Connect Wallet"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}