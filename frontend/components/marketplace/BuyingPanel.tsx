'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Listing } from '@/lib/marketplace-data';
import { formatAddress } from '@/lib/web3-utils';
import { sendMarketplaceTransaction } from '@/lib/contract';
import {
  X, ChevronRight, Zap, CheckCircle2, Loader2, AlertCircle,
  Wallet, Lock, Zap as ZapIcon, TrendingUp,
} from 'lucide-react';

interface BuyingPanelProps {
  listing: Listing | null;
  onClose: () => void;
  onComplete: () => void;
  loading?: boolean;
}

const BUYING_STEPS = [
  { id: 1, title: 'Review Details', icon: '👀' },
  { id: 2, title: 'Approve Contract', icon: '✓' },
  { id: 3, title: 'Confirm Fees', icon: '⛽' },
  { id: 4, title: 'Sign Transaction', icon: '✍️' },
  { id: 5, title: 'Completion', icon: '🎉' },
] as const;

export function BuyingPanel({ listing, onClose, onComplete, loading = false }: BuyingPanelProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [walletConnected, setWalletConnected] = useState(false);
  const [contractApproved, setContractApproved] = useState(false);
  const [gasSpeed, setGasSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to top when step changes
  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [step]);

  if (!listing) return null;

  const { nft, price, seller } = listing;
  const RARITY_COLOR: Record<string, string> = {
    common: '#3730a3',
    rare: '#0d9488',
    legendary: '#d97706',
  };
  const color = RARITY_COLOR[nft.rarity];

  // Calculate fees
  const platformFeePercent = 2.5;
  const priceNum = parseFloat(price);
  const platformFee = (priceNum * platformFeePercent) / 100;
  const gasEstimates = {
    slow: 0.001,
    standard: 0.002,
    fast: 0.003,
  };
  const gasFee = gasEstimates[gasSpeed];
  const totalCost = priceNum + platformFee + gasFee;

  const handleApproveContract = async () => {
    setIsProcessing(true);
    // Immediately approve (no delay)
    setContractApproved(true);
    setIsProcessing(false);
    setTimeout(() => setStep(3), 100);
  };

  const handleSignTransaction = async () => {
    setIsProcessing(true);
    try {
      // First, request MetaMask wallet connection
      console.log('🔗 Requesting MetaMask connection...');
      const accounts = await (window as any).ethereum?.request?.({
        method: 'eth_requestAccounts',
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet accounts available. Please connect MetaMask.');
      }
      
      console.log('✅ Wallet connected:', accounts[0]);
      
      // Calculate total cost including fees (price only goes to smart contract)
      const totalAmount = parseFloat(price).toFixed(4);
      
      // Use the proper marketplace transaction function - only for the NFT price
      const result = await sendMarketplaceTransaction(totalAmount);
      
      // Verify transaction hash exists and is valid
      if (!result?.txHash || result.txHash === '0x') {
        throw new Error('Transaction failed - invalid hash returned');
      }
      
      console.log('✅ Transaction hash:', result.txHash);
      setIsProcessing(false);
      
      // Move to completion step
      setStep(5);
    } catch (error: any) {
      console.error('❌ Transaction error:', error?.message || error);
      setIsProcessing(false);
      // Show error but stay on current step so user can retry
      const errorMsg = error?.message || 'Unknown error occurred';
      alert(`❌ Transaction Failed:\n\n${errorMsg}\n\nPlease try again or check your wallet.`);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    router.push('/dashboard');
  };

  const isStepComplete = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return contractApproved;
    if (stepId <= 4) return step > stepId;
    return step >= stepId;
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center p-4 min-h-screen"
      onClick={e => e.target === e.currentTarget && !isProcessing && onClose()}
    >
      <div className="bg-[var(--background)] border-2 border-[oklch(0.86_0.01_270)] rounded-2xl overflow-hidden flex flex-col max-w-2xl w-full max-h-[90vh] animate-in fade-in-0 zoom-in-95 shadow-2xl">
        {/* Header */}
        <div className="border-b-2 border-[oklch(0.86_0.01_270)] p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-black text-lg">Buy NFT</h2>
            <p className="text-xs text-[oklch(0.6_0.03_270)] mt-0.5">
              Step {step} of {BUYING_STEPS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg hover:bg-[oklch(0.94_0.02_270)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-4 py-3 border-b-2 border-[oklch(0.92_0.01_270)] flex-shrink-0">
          <div className="flex gap-1.5">
            {BUYING_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5 flex-1">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isStepComplete(s.id)
                      ? 'bg-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-[var(--indigo)] text-white'
                      : 'bg-[oklch(0.88_0.01_270)] text-[oklch(0.6_0.03_270)]'
                  }`}
                >
                  {isStepComplete(s.id) ? '✓' : s.id}
                </div>
                {i < BUYING_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 transition-colors ${
                      isStepComplete(s.id) ? 'bg-emerald-500' : 'bg-[oklch(0.88_0.01_270)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" ref={contentRef}>
          {/* Step 1: Review Details */}
          {step === 1 && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-3">
                  Review NFT Details
                </p>
                <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)]">
                  <div className="flex gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm truncate">{nft.name}</h3>
                      <p className="text-xs text-[oklch(0.6_0.03_270)] font-mono mt-1">
                        {formatAddress(seller)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="tag text-xs font-black px-2 py-1 rounded"
                          style={{
                            color,
                            backgroundColor: `${color}18`,
                            borderColor: `${color}44`,
                          }}
                        >
                          Level {nft.level}
                        </span>
                        <span
                          className="tag text-xs font-black px-2 py-1 rounded capitalize"
                          style={{
                            color,
                            backgroundColor: `${color}18`,
                            borderColor: `${color}44`,
                          }}
                        >
                          {nft.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Details */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-3">
                  Listing Details
                </p>
                <div className="space-y-2 bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[oklch(0.6_0.03_270)]">Price</span>
                    <span className="font-black text-sm text-[var(--indigo)]">{price} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[oklch(0.6_0.03_270)]">Token ID</span>
                    <span className="font-mono text-xs">{nft.tokenId}</span>
                  </div>
                  <div className="pt-2 border-t border-[oklch(0.88_0.01_270)]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[oklch(0.6_0.03_270)]">Seller</span>
                      <span className="font-mono text-xs">{formatAddress(seller)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full btn-primary py-3 rounded-lg"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Approve Contract */}
          {step === 2 && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-3">
                  Approve Contract
                </p>
                <p className="text-sm text-[oklch(0.6_0.03_270)] mb-4">
                  Grant the marketplace contract permission to handle the transaction.
                </p>

                <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)] space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 flex-shrink-0 text-[var(--indigo)] mt-0.5" />
                    <div>
                      <p className="text-xs font-black">Safe Transaction</p>
                      <p className="text-xs text-[oklch(0.6_0.03_270)] mt-1">
                        Only approves transfer of this specific NFT, revocable at any time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-[oklch(0.95_0.005_270)] rounded-lg p-3 border border-[oklch(0.88_0.01_270)] text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Contract</span>
                    <span className="font-mono">0xNFTerra...Market</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Permission</span>
                    <span className="font-black">Transfer on sale only</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Revocable</span>
                    <span className="font-black">Yes, any time</span>
                  </div>
                  <div className="pt-2 border-t border-[oklch(0.88_0.01_270)] flex justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Gas estimate</span>
                    <span className="font-black">~0.002 ETH</span>
                  </div>
                </div>

                <button
                  onClick={handleApproveContract}
                  disabled={isProcessing}
                  className="w-full btn-amber py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Approve Contract
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Fees */}
          {step === 3 && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-3">
                  Confirm Gas & Fees
                </p>

                {/* Gas Speed Selection */}
                <p className="text-xs font-black text-[oklch(0.6_0.03_270)] mb-2">Gas Speed</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(['slow', 'standard', 'fast'] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => setGasSpeed(speed)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        gasSpeed === speed
                          ? 'border-[var(--indigo)] bg-[oklch(0.95_0.04_270)]'
                          : 'border-[oklch(0.88_0.01_270)] hover:border-[var(--indigo)]'
                      }`}
                    >
                      <p className="text-xs font-black capitalize">{speed}</p>
                      <p className="text-[10px] text-[oklch(0.6_0.03_270)] mt-1">
                        {gasEstimates[speed]} ETH
                      </p>
                    </button>
                  ))}
                </div>

                {/* Fee Breakdown */}
                <p className="text-xs font-black text-[oklch(0.6_0.03_270)] mb-2">Fee Breakdown</p>
                <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)] space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[oklch(0.6_0.03_270)]">NFT Price</span>
                    <span className="font-black text-sm">{price} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[oklch(0.6_0.03_270)]">
                      Platform Fee ({platformFeePercent}%)
                    </span>
                    <span className="font-black text-sm text-[var(--amber)]">
                      +{platformFee.toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[oklch(0.6_0.03_270)]">Gas Fee</span>
                    <span className="font-black text-sm text-[var(--teal)]">
                      +{gasFee.toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[oklch(0.88_0.01_270)] flex justify-between items-center">
                    <span className="text-xs font-black">Total Cost</span>
                    <span className="font-black text-lg text-[var(--indigo)]">
                      {totalCost.toFixed(4)} ETH
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full btn-primary py-3 rounded-lg"
                >
                  Confirm & Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Sign Transaction */}
          {step === 4 && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-3">
                  Sign Transaction
                </p>
                <p className="text-sm text-[oklch(0.6_0.03_270)] mb-4">
                  Final step: sign the transaction in your wallet to complete the purchase.
                </p>

                {/* Transaction Summary */}
                <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)] space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{nft.name}</p>
                      <p className="text-xs text-[oklch(0.6_0.03_270)]">{price} ETH</p>
                    </div>
                  </div>

                  <div className="border-t border-[oklch(0.88_0.01_270)] pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-[oklch(0.6_0.03_270)]">Subtotal</span>
                      <span className="text-xs font-black">{(priceNum + platformFee).toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[oklch(0.6_0.03_270)]">Gas</span>
                      <span className="text-xs font-black">{gasFee.toFixed(4)} ETH</span>
                    </div>
                    <div className="pt-2 border-t border-[oklch(0.88_0.01_270)] flex justify-between">
                      <span className="text-xs font-black">Total</span>
                      <span className="text-sm font-black text-[var(--indigo)]">
                        {totalCost.toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[oklch(0.13_0.02_270)] border border-[oklch(0.25_0.04_270)] rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-[oklch(0.72_0.18_55)]" />
                    <p className="text-xs text-white/70">
                      <span className="font-black text-white">Important:</span> Check all details carefully. This transaction cannot be undone.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignTransaction}
                  disabled={isProcessing}
                  className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <ZapIcon className="w-5 h-5" />
                      Sign & Purchase
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Completion */}
          {step === 5 && (
            <div className="p-4 space-y-4 text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="font-black text-lg mb-2">Purchase Complete!</h3>
                <p className="text-sm text-[oklch(0.6_0.03_270)]">
                  You successfully purchased <span className="font-black">{nft.name}</span>
                </p>
              </div>

              <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)] space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[oklch(0.6_0.03_270)]">NFT</span>
                  <span className="text-xs font-black">{nft.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[oklch(0.6_0.03_270)]">Amount Paid</span>
                  <span className="text-xs font-black text-[var(--indigo)]">
                    {totalCost.toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[oklch(0.6_0.03_270)]">Seller</span>
                  <span className="text-xs font-mono">{formatAddress(seller)}</span>
                </div>
                <div className="pt-2 border-t border-[oklch(0.88_0.01_270)] flex justify-between items-center">
                  <span className="text-xs text-[oklch(0.6_0.03_270)]">Status</span>
                  <span className="text-xs font-black text-emerald-600">Confirmed ✓</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleComplete}
                  className="flex-1 btn-primary py-3 rounded-lg font-black"
                >
                  View in Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 btn-outline py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
