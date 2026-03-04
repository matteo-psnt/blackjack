import React, { useEffect, useState } from 'react';
import { GameState } from './enums';

interface BettingControlsProps {
  currentBet: number;
  setBetAmount: (value: number) => void;
  gameState: GameState;
}

const getDigitsOnly = (value: string) => value.replace(/\D/g, '');

const CHIP_PRESETS = [5, 10, 25, 100];

const BettingControls: React.FC<BettingControlsProps> = ({
  currentBet,
  setBetAmount,
  gameState,
}) => {
  const [draftValue, setDraftValue] = useState(String(currentBet));
  const [isEditing, setIsEditing] = useState(false);
  const isBetting = gameState === GameState.Betting;

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(String(currentBet));
    }
  }, [currentBet, isEditing]);

  const commitDraft = () => {
    const parsed = draftValue === '' ? 0 : parseInt(draftValue, 10);
    setBetAmount(Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleFocus = () => {
    setIsEditing(true);
    setDraftValue(String(currentBet));
  };

  const handleBlur = () => {
    commitDraft();
    setIsEditing(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraftValue(getDigitsOnly(event.target.value));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = event.key === 'ArrowUp' ? currentBet + 1 : Math.max(currentBet - 1, 0);
      setDraftValue(String(next));
      setBetAmount(next);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-[0.1em]">
        <span className="text-white/40 text-[0.32em] font-bold tracking-[0.2em] uppercase">
          Bet
        </span>
        <input
          type="text"
          inputMode="numeric"
          readOnly={!isBetting}
          value={isEditing ? draftValue : `$${currentBet}`}
          className={`px-2 py-1 rounded text-white font-bold text-[0.8em] outline-none transition-colors w-[5.5em] bg-transparent ${
            isBetting
              ? 'cursor-text border border-white/25 focus:border-white/50 focus:bg-black/30'
              : 'border border-transparent pointer-events-none'
          }`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isBetting && (
        <div className="flex gap-1.5">
          {CHIP_PRESETS.map((chipValue) => (
            <button
              key={chipValue}
              className="px-2 py-1 border border-white/20 rounded text-white/60 text-[0.36em] font-bold hover:border-white/45 hover:text-white/90 hover:bg-white/[0.05] transition-all"
              onClick={() => setBetAmount(currentBet + chipValue)}
            >
              +{chipValue}
            </button>
          ))}
          <button
            className="px-2 py-1 border border-white/15 rounded text-white/35 text-[0.36em] font-bold hover:border-white/30 hover:text-white/55 transition-all"
            onClick={() => setBetAmount(0)}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default BettingControls;
