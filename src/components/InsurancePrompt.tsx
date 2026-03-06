import React from 'react';
import { GameState } from './enums';

interface InsurancePromptProps {
  gameState: GameState;
  onBuyInsurance: () => void;
  onDeclineInsurance: () => void;
  insuranceCost: number;
  canAffordInsurance: boolean;
}

const InsurancePrompt: React.FC<InsurancePromptProps> = ({
  gameState,
  onBuyInsurance,
  onDeclineInsurance,
  insuranceCost,
  canAffordInsurance,
}) => {
  if (gameState !== GameState.Insurance) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 w-[min(24em,34%)] -translate-x-1/2 -translate-y-1/2 px-[0.85em] pt-[0.7em] pb-[0.7em] border border-white/15 rounded-lg bg-black/80 backdrop-blur-md text-left">
      <div className="mb-[0.4em] text-red-400 text-[0.42em] font-bold tracking-wider uppercase">
        Insurance
      </div>
      <p className="m-0 text-white text-[0.85em] font-bold leading-[1.35]">
        Buy insurance for ${insuranceCost}?
      </p>
      <p className="mt-[0.3em] mb-0 text-white/50 text-[0.52em] leading-[1.4]">
        Protects your bet if dealer has blackjack.
      </p>
      <div className="flex gap-[0.4em] mt-[0.8em]">
        <button
          className={`flex-1 border rounded px-[0.8em] py-[0.5em] font-bold text-[0.52em] uppercase transition-colors ${
            canAffordInsurance
              ? 'border-red-700 bg-red-700 text-white hover:bg-red-600'
              : 'border-white/15 bg-transparent text-white/25 cursor-not-allowed'
          }`}
          onClick={onBuyInsurance}
          disabled={!canAffordInsurance}
          title={!canAffordInsurance ? 'Not enough chips to buy insurance' : undefined}
        >
          Yes
        </button>
        <button
          className="flex-1 border border-white/35 rounded bg-transparent text-white px-[0.8em] py-[0.5em] font-bold text-[0.52em] uppercase hover:border-white/55 hover:bg-white/[0.05] transition-colors"
          onClick={onDeclineInsurance}
        >
          No
        </button>
      </div>
      {!canAffordInsurance && (
        <p className="mt-[0.5em] mb-0 text-red-400 text-[0.48em] font-medium">
          Not enough chips for insurance.
        </p>
      )}
    </div>
  );
};

export default InsurancePrompt;
