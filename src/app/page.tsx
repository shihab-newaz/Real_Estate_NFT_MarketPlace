"use client";
import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Image from 'next/image';
import { Search, Wallet, Key } from 'lucide-react';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useRouter } from 'next/navigation';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  type: string;
  img: string;
}

interface MarketStats {
  totalListings: number;
  totalValue: number;
  recentSales: number;
}

interface ChartData {
  name: string;
  sales: number;
}

const HomePage: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalListings: 0,
    totalValue: 0,
    recentSales: 0
  });
  const { address, connectWallet } = useWalletConnection();
  const router = useRouter();

  useEffect(() => {
    // Fetch featured properties and market stats here
    // For now, we'll use dummy data
    setFeaturedProperties([
      { id: 1, title: 'Luxury Condo', price: 250000, location: 'New York', type: 'Apartment', img:'/luxury.png' },
      { id: 2, title: 'Beachfront Villa', price: 500000, location: 'Miami', type: 'House', img:'/villa.png' },
      { id: 3, title: 'Downtown Loft', price: 180000, location: 'Chicago', type: 'Apartment', img:'/loft.png' },
    ]);
    setMarketStats({
      totalListings: 156,
      totalValue: 45000000,
      recentSales: 12
    });
  }, []);

  const chartData: ChartData[] = [
    { name: 'Jan', sales: 4 },
    { name: 'Feb', sales: 3 },
    { name: 'Mar', sales: 5 },
    { name: 'Apr', sales: 7 },
    { name: 'May', sales: 2 },
    { name: 'Jun', sales: 6 },
  ];

  const handleExploreProperties = () => {
    router.push('/marketplace');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-96 mb-8">
        <Image
          src="/hero.png"
          alt="Hero Image"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Welcome to RE NFT Marketplace</h1>
            <p className="text-xl text-white mb-8">Discover and invest in unique real estate NFTs</p>
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
              onClick={handleExploreProperties}
            >
              Explore Properties
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Listings</h2>
            <p className="text-3xl font-bold text-blue-600">{marketStats.totalListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Value</h2>
            <p className="text-3xl font-bold text-blue-600">${marketStats.totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Recent Sales</h2>
            <p className="text-3xl font-bold text-blue-600">{marketStats.recentSales}</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {featuredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={property.img}
                  className="w-full h-full object-cover"
                  alt={property.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <p className="text-gray-600 mb-2">{property.type}</p>
                <p className="text-xl font-bold mb-4 text-gray-800">${property.price.toLocaleString()}</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">View Property</button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <Search className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Properties</h3>
              <p className="text-gray-600">Explore our curated selection of real estate NFTs</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <Wallet className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Link your crypto wallet to make secure transactions</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <Key className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Invest &amp; Own</h3>
              <p className="text-gray-600">Purchase your chosen property NFT and become an owner</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            onClick={connectWallet}
          >
            {address ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;