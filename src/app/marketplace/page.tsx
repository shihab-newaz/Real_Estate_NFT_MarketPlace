// app/marketplace/page.tsx
import { Suspense } from "react";
import { fetchProperties } from "@/app/actions/propertyFetch";
import MarketplaceClient from "./Client";

export default async function MarketplacePage() {
  const initialProperties = await fetchProperties();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Real Estate NFT Marketplace</h1>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-8">
          </div>
        }>
          <MarketplaceClient initialProperties={initialProperties} />
        </Suspense>
      </main>
    </div>
  );
}