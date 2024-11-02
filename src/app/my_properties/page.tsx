// src/app/my-properties/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { MyPropertiesClient } from './client';
import { Property } from '@/types/property';

export const metadata = {
  title: 'My Properties | Real Estate NFT Marketplace',
  description: 'View and manage your real estate NFT properties',
};

export default async function MyPropertiesPage() {
  // Get initial properties from cookies if available
  const cookieStore = cookies();
  const propertiesCookie = cookieStore.get('myProperties');
  const initialProperties: Property[] = propertiesCookie 
    ? JSON.parse(propertiesCookie.value)
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Properties</h1>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }>
          <MyPropertiesClient initialProperties={initialProperties} />
        </Suspense>
      </main>
    </div>
  );
}