'use client'

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { getEstimatedOutput, executeSwap } from '@/app/actions/swap';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { 
  ArrowDownCircle, 
  Settings, 
  RefreshCw 
} from 'lucide-react';
import { COMMON_TOKENS, MATIC_SWAP_ADDRESS } from '@/constants';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SwapState {
  tokenIn: string;
  tokenInSymbol: string;
  amountIn: string;
  amountOut: string;
  slippageTolerance: number;
  isLoading: boolean;
  isSwapping: boolean;
}

export default function SwapClient() {
  const { address, connectWallet } = useWalletConnection();
  const [state, setState] = useState<SwapState>({
    tokenIn: '',
    tokenInSymbol: '',
    amountIn: '',
    amountOut: '',
    slippageTolerance: 0.5,
    isLoading: false,
    isSwapping: false,
  });

  // Debounced estimate update
  useEffect(() => {
    const timer = setTimeout(updateEstimate, 500);
    return () => clearTimeout(timer);
  }, [state.tokenIn, state.amountIn]);

  const updateEstimate = async () => {
    if (!state.tokenIn || !state.amountIn || parseFloat(state.amountIn) === 0) {
      setState(prev => ({ ...prev, amountOut: '' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await getEstimatedOutput(state.tokenIn, state.amountIn);
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          amountOut: result.amount ?? '', // the nullish coalescing operator provides a default value
          isLoading: false 
        }));
      } else {
        toast.error('Failed to get estimate');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error('Error getting estimate');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleTokenSelect = (value: string) => {
    const selectedToken = COMMON_TOKENS.find(token => token.address === value);
    if (selectedToken) {
      setState(prev => ({
        ...prev,
        tokenIn: selectedToken.address,
        tokenInSymbol: selectedToken.symbol
      }));
    }
  };

  const handleSwap = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!state.tokenIn || !state.amountIn || !state.amountOut) {
      toast.error('Please fill in all fields');
      return;
    }

    setState(prev => ({ ...prev, isSwapping: true }));
    try {
      // First approve the token
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        state.tokenIn,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );

      const amountInWei = ethers.parseUnits(state.amountIn, 18);
      const approveTx = await tokenContract.approve(MATIC_SWAP_ADDRESS, amountInWei);
      await approveTx.wait();

      // Then execute the swap
      const swapResult = await executeSwap(
        state.tokenIn,
        state.amountIn,
        state.amountOut,
        state.slippageTolerance
      );

      if (!swapResult.success || !swapResult.params) {
        throw new Error(swapResult.error || 'Failed to prepare swap');
      }

      // Execute the swap transaction
      const swapContract = new ethers.Contract(
        MATIC_SWAP_ADDRESS,
        ['function swapTokenForMatic(address tokenIn, uint256 amountIn, uint256 minAmountOut) external returns (uint256)'],
        signer
      );

      const swapTx = await swapContract.swapTokenForMatic(
        swapResult.params.tokenIn,
        swapResult.params.amountIn,
        swapResult.params.minAmountOut
      );

      await swapTx.wait();
      toast.success('Swap completed successfully!');
      
      // Reset form
      setState(prev => ({
        ...prev,
        amountIn: '',
        amountOut: '',
        isSwapping: false
      }));
    } catch (error) {
      console.error('Swap error:', error);
      toast.error(error instanceof Error ? error.message : 'Swap failed');
      setState(prev => ({ ...prev, isSwapping: false }));
    }
  };

  if (!address) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to swap tokens.</p>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Token Input Section */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>From</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    {state.slippageTolerance}% Slippage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Slippage Tolerance</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.1, 0.5, 1.0, 2.0].map((value) => (
                      <Button
                        key={value}
                        variant={state.slippageTolerance === value ? "default" : "outline"}
                        onClick={() => setState(prev => ({ ...prev, slippageTolerance: value }))}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex space-x-2">
              <Select value={state.tokenIn} onValueChange={handleTokenSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="0.0"
                value={state.amountIn}
                onChange={(e) => setState(prev => ({ ...prev, amountIn: e.target.value }))}
              />
            </div>
          </div>

          {/* Swap Direction Indicator */}
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-full p-2">
              <ArrowDownCircle className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          {/* MATIC Output Section */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex space-x-2">
              <div className="w-[180px] bg-gray-100 rounded-lg flex items-center px-4">
                <span>MATIC</span>
              </div>
              <Input
                type="number"
                placeholder="0.0"
                value={state.amountOut}
                disabled
              />
            </div>
          </div>

          {/* Price Impact and Route Info */}
          {state.amountIn && state.amountOut && (
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Rate</span>
                <span>1 {state.tokenInSymbol} = {(parseFloat(state.amountOut) / parseFloat(state.amountIn)).toFixed(6)} MATIC</span>
              </div>
              <div className="flex justify-between">
                <span>Route</span>
                <span>{state.tokenInSymbol} → WMATIC → MATIC</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            className="w-full"
            onClick={handleSwap}
            disabled={!state.tokenIn || !state.amountIn || state.isSwapping}
          >
            {state.isSwapping ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {state.isSwapping ? 'Swapping...' : 'Swap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}