// src/app/create-listing/page.tsx
import { Suspense } from "react";
import { PropertyForm } from "./PropertyForm";
import { NFT_MARKETPLACE_ADDRESS } from "@/utils/contractUtil";
import { Card } from "@/components/ui/card";

// Add metadata
export const metadata = {
  title: "Create Property Listing | Real Estate NFT Marketplace",
  description: "List your property as an NFT on our marketplace",
};

async function getContractConfig() {
  return {
    address: NFT_MARKETPLACE_ADDRESS,
    // Add any other contract configuration you need
  };
}

export default async function CreateListingPage() {
  const contractConfig = await getContractConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Property Listing
          </h1>
          <p className="mt-2 text-gray-600">
            List your property as an NFT on our marketplace. Make sure to
            provide accurate details and high-quality images.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading...</div>}>
              <PropertyForm NFT_MARKETPLACE_ADDRESS={contractConfig.address} />
            </Suspense>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Listing Guidelines</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Property details must be accurate and verifiable</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Images should be clear and representative of the property
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Listing fee: 0.025 MATIC</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Process: Mint NFT → List Property</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fees & Gas</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Minting Fee: Gas cost only</p>
                <p>• Listing Fee: 0.025 MATIC + Gas</p>
                <p>• Network: Polygon Mumbai</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  If you need assistance or have questions about listing your
                  property, please check our FAQ or contact support.
                </p>
                <div className="flex space-x-4 mt-4">
                  <a
                    href="/faq"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View FAQ
                  </a>
                  <a
                    href="/support"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
