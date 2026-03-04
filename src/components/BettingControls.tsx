import React, { useEffect, useState } from 'react';
import '../styles/BettingControls.css';
import { GameState } from './enums';

interface BettingControlsProps {
  currentBet: number;
  setBetAmount: (value: number) => void;
  gameState: GameState;
}

const ALLOWED_KEYS = new Set([
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Enter',
  'Backspace',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Delete',
  'Tab',
]);

const getDigitsOnly = (value: string | null | undefined) => (value ?? '').replace(/\D/g, '');

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
    const parsedValue = draftValue === '' ? 0 : parseInt(draftValue, 10);
    setBetAmount(Number.isNaN(parsedValue) ? 0 : parsedValue);
  };

  const handleFocus = () => {
    if (!isBetting) {
      return;
    }

    setIsEditing(true);
    setDraftValue(String(currentBet));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (!ALLOWED_KEYS.has(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();

      const nextBet = event.key === 'ArrowUp' ? currentBet + 1 : Math.max(currentBet - 1, 0);

      setDraftValue(String(nextBet));
      setBetAmount(nextBet);
    }
  };

  const handleBlur = () => {
    if (isBetting) {
      commitDraft();
    }

    setIsEditing(false);
  };

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const currentText = event.currentTarget.textContent ?? event.currentTarget.innerText;
    const digitsOnly = getDigitsOnly(currentText);

    setIsEditing(true);
    setDraftValue(digitsOnly);

    if (currentText !== digitsOnly) {
      event.currentTarget.textContent = digitsOnly;
      window.getSelection()?.collapse(event.currentTarget, event.currentTarget.childNodes.length);
    }
  };

  return (
    <div
      className="current-bet"
      contentEditable={isBetting}
      suppressContentEditableWarning
      tabIndex={0}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onInput={handleInput}
    >
      {isEditing ? draftValue : `${currentBet}$`}
    </div>
  );
};

export default BettingControls;
