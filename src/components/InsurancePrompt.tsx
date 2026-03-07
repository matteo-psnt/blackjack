import React from 'react';
import { GameState } from '../game/model';
import { useIsMobile } from '../hooks/useIsMobile';

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
  const isMobile = useIsMobile();

  if (gameState !== GameState.Insurance) {
    return null;
  }

  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/15 rounded-lg bg-black/80 backdrop-blur-md text-left ${isMobile ? 'w-[78%] px-[1.4em] pt-[1.1em] pb-[1.1em]' : 'w-[min(24em,34%)] px-[0.85em] pt-[0.7em] pb-[0.7em]'}`}
    >
      <div
        className={`mb-[0.4em] text-red-400 font-bold tracking-wider uppercase ${isMobile ? 'text-[0.58em]' : 'text-[0.42em]'}`}
      >
        Insurance
      </div>
      <p
        className={`m-0 text-white font-bold leading-[1.35] ${isMobile ? 'text-[1.1em]' : 'text-[0.85em]'}`}
      >
        Buy insurance for ${insuranceCost}?
      </p>
      <p
        className={`mt-[0.3em] mb-0 text-white/50 leading-[1.4] ${isMobile ? 'text-[0.68em]' : 'text-[0.52em]'}`}
      >
        Protects your bet if dealer has blackjack.
      </p>
      <div className={`flex gap-[0.4em] ${isMobile ? 'mt-[1.2em]' : 'mt-[0.8em]'}`}>
        <button
          className={`flex-1 border rounded font-bold uppercase transition-colors ${isMobile ? 'px-[1em] py-[0.8em] text-[0.68em]' : 'px-[0.8em] py-[0.5em] text-[0.52em]'} ${
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
          className={`flex-1 border border-white/35 rounded bg-transparent text-white font-bold uppercase hover:border-white/55 hover:bg-white/[0.05] transition-colors ${isMobile ? 'px-[1em] py-[0.8em] text-[0.68em]' : 'px-[0.8em] py-[0.5em] text-[0.52em]'}`}
          onClick={onDeclineInsurance}
        >
          No
        </button>
      </div>
      {!canAffordInsurance && (
        <p
          className={`mt-[0.5em] mb-0 text-red-400 font-medium ${isMobile ? 'text-[0.62em]' : 'text-[0.48em]'}`}
        >
          Not enough chips for insurance.
        </p>
      )}
    </div>
  );
};

export default InsurancePrompt;
