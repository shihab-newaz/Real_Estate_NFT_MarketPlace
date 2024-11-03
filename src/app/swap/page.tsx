// app/swap/page.tsx
import { Suspense } from 'react';
import SwapClient from './client';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Token Swap | Real Estate NFT Marketplace',
  description: 'Swap your tokens for MATIC',
};

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Swap Tokens</h1>
          <p className="mt-2 text-gray-600">
            Swap your tokens for MATIC using our decentralized exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading...</div>}>
              <SwapClient />
            </Suspense>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Swap Guidelines</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Select any ERC20 token to swap for MATIC</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Prices are provided by Uniswap V2 oracles</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Slippage tolerance can be adjusted</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gas fees are paid in MATIC</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Supported Tokens</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Any ERC20 token with Uniswap V2 liquidity</p>
                <p>• Common tokens: USDC, USDT, DAI</p>
                <p>• Network: Polygon Mumbai</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}