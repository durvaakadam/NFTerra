'use client';

import React from 'react';
import { NFT, EVOLUTION_STAGES } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

const STAGE_EMOJIS = ['🥚', '👹', '🐉', '🔥', '✨'];

interface LevelUpModalProps {
  isOpen: boolean;
  nft: NFT;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LevelUpModal({ isOpen, nft, onConfirm, onCancel, isLoading = false }: LevelUpModalProps) {
  const [step, setStep] = React.useState(1); // Step 1: Confirm, Step 2: Processing
  const [isProcessing, setIsProcessing] = React.useState(false);
  const maxLevelReached = nft.level >= 5;
  const nextLevel = nft.level + 1;
  const nextStage = EVOLUTION_STAGES[nextLevel - 1];
  const currentStage = EVOLUTION_STAGES[nft.level - 1];

  const handleNext = () => {
    setStep(2);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      setStep(1); // Reset for next time
    }
  };

  const handleCancel = () => {
    setStep(1); // Reset step
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md bg-[var(--background)] border-2 border-[oklch(0.88_0.01_270)] shadow-2xl p-4 sm:p-6">
        <DialogTitle className="sr-only">Evolution Modal</DialogTitle>
        {/* Step 1: Evolution Overview */}
        {step === 1 && (
          <div className="space-y-4 py-0">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-3">Evolution Overview</p>
            </div>

            {/* Current vs Next */}
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Current */}
              <div className="text-center p-4 rounded-lg border-2 border-[oklch(0.88_0.01_270)] bg-[oklch(0.95_0.005_270)]">
                <p className="text-xs font-black uppercase text-[oklch(0.5_0.03_270)] mb-2">Current</p>
                <span className="text-5xl block mb-2">{STAGE_EMOJIS[nft.level - 1]}</span>
                <p className="font-black text-sm">{currentStage?.name}</p>
                <p className="text-xs text-[oklch(0.6_0.03_270)]">Level {nft.level}</p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="rounded-full bg-[var(--indigo)] p-2">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Next */}
              {!maxLevelReached ? (
                <div className="text-center p-4 rounded-lg border-2 border-dashed border-[var(--indigo)] bg-[oklch(0.95_0.04_270)]">
                  <p className="text-xs font-black uppercase text-[var(--indigo)] mb-2">Next</p>
                  <span className="text-5xl block mb-2">{STAGE_EMOJIS[nextLevel - 1]}</span>
                  <p className="font-black text-sm text-[var(--indigo)]">{nextStage?.name}</p>
                  <p className="text-xs text-[var(--indigo)]">Level {nextLevel}</p>
                </div>
              ) : (
                <div className="text-center p-4 rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-black text-sm text-emerald-700">Max Level!</p>
                  <p className="text-xs text-emerald-600 mt-1">Immortal</p>
                </div>
              )}
            </div>

            {/* NFT Info */}
            <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-4 border border-[oklch(0.88_0.01_270)]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{STAGE_EMOJIS[nft.level - 1]}</span>
                <div className="flex-1">
                  <p className="font-black text-lg">{nft.name}</p>
                  <p className="text-sm text-[oklch(0.6_0.03_270)] font-mono">#{nft.tokenId}</p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            {!maxLevelReached && (
              <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-3 border border-[oklch(0.88_0.01_270)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[oklch(0.6_0.03_270)]">Evolution Cost:</span>
                  <span className="font-black text-[var(--amber)]">0.02 ETH</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[oklch(0.6_0.03_270)]">Gas Fee (est):</span>
                  <span className="font-black text-[oklch(0.5_0.03_270)]">0.005 ETH</span>
                </div>
                <div className="pt-2 border-t border-[oklch(0.88_0.01_270)] flex justify-between items-center">
                  <span className="text-xs font-black">Total:</span>
                  <span className="text-sm font-black text-[var(--indigo)]">0.025 ETH</span>
                </div>
              </div>
            )}

            {/* What Happens Next */}
            {!maxLevelReached && (
              <div className="bg-[oklch(0.94_0.04_270)] rounded-lg p-3 border-2 border-[var(--indigo)]">
                <p className="font-black text-[var(--indigo)] text-xs mb-1">What happens next:</p>
                <p className="text-xs text-[oklch(0.5_0.03_270)] leading-relaxed">
                  Your NFT will evolve visually and gain new attributes. You'll be able to sell it at a higher floor price on secondary markets.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 border-2 border-[var(--indigo)] text-[var(--indigo)] font-black py-2 text-sm rounded-lg hover:bg-[oklch(0.95_0.04_270)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={maxLevelReached}
                className={`flex-1 font-black py-2 text-sm rounded-lg flex items-center justify-center gap-1.5 ${
                  maxLevelReached
                    ? 'bg-[oklch(0.95_0.005_270)] text-[oklch(0.6_0.03_270)] cursor-not-allowed'
                    : 'bg-[var(--indigo)] text-white hover:bg-[oklch(0.45_0.04_270)] transition-colors'
                }`}
              >
                {maxLevelReached ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Max Level
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Review Details
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="space-y-4 py-0">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.5_0.03_270)] mb-1">Step 2 of 2</p>
              <h3 className="text-lg font-black">Confirm Evolution</h3>
            </div>

            {/* Summary */}
            <div className="bg-[oklch(0.95_0.005_270)] rounded-lg p-3 border border-[oklch(0.88_0.01_270)] space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">NFT:</span>
                  <span className="text-xs font-mono">{nft.name} #{nft.tokenId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">Current Level:</span>
                  <span className="text-xs font-black text-[var(--indigo)]">Level {nft.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">New Level:</span>
                  <span className="text-xs font-black text-[var(--indigo)]">Level {nextLevel}</span>
                </div>
                <div className="pt-2 border-t border-[oklch(0.88_0.01_270)] flex justify-between items-center">
                  <span className="text-xs font-black">Total Cost:</span>
                  <span className="text-sm font-black text-[var(--amber)]">0.025 ETH</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-[oklch(0.96_0.06_75)] rounded-lg p-3 border-2 border-[var(--amber)]">
              <p className="text-xs text-[oklch(0.5_0.08_75)] leading-relaxed">
                <span className="font-black">Important:</span> Once confirmed, this transaction cannot be reversed. Please ensure you have sufficient ETH in your wallet.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                disabled={isProcessing || isLoading}
                className="flex-1 border-2 border-[var(--indigo)] text-[var(--indigo)] font-black py-2 text-sm rounded-lg hover:bg-[oklch(0.95_0.04_270)] transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing || isLoading}
                className={`flex-1 font-black py-2 text-sm rounded-lg flex items-center justify-center gap-1.5 ${
                  isProcessing || isLoading
                    ? 'bg-[oklch(0.95_0.005_270)] text-[oklch(0.6_0.03_270)] cursor-not-allowed opacity-70'
                    : 'bg-[var(--indigo)] text-white hover:bg-[oklch(0.45_0.04_270)] transition-colors'
                }`}
              >
                {isProcessing || isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Evolve Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
