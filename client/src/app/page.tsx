'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  type: string;
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

  useEffect(() => {
    // Fetch featured properties and market stats here
    // For now, we'll use dummy data
    setFeaturedProperties([
      { id: 1, title: 'Luxury Condo', price: 250000, location: 'New York', type: 'Apartment' },
      { id: 2, title: 'Beachfront Villa', price: 500000, location: 'Miami', type: 'House' },
      { id: 3, title: 'Downtown Loft', price: 180000, location: 'Chicago', type: 'Apartment' },
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

  return (
    <div className="min-h-screen bg-gray-300">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to RE NFT Marketplace</h1>
        
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
            <div key={property.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{property.title}</h3>
              <p className="text-gray-600 mb-2">{property.location}</p>
              <p className="text-gray-600 mb-2">{property.type}</p>
              <p className="text-xl font-bold mb-4 text-gray-800">${property.price.toLocaleString()}</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">View Property</button>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Market Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow-md mb-12">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#4B5563" />
                <YAxis stroke="#4B5563" />
                <Tooltip />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">Explore All Properties</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;