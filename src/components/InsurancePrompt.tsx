import React from 'react';
import { GameState } from './enums';
import '../styles/InsurancePrompt.css';

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
    <div className="prompt-container">
      <p>Do you want to buy insurance for ${insuranceCost}?</p>
      <button
        className="prompt-button"
        onClick={onBuyInsurance}
        disabled={!canAffordInsurance}
        title={!canAffordInsurance ? 'Not enough chips to buy insurance' : undefined}
      >
        Yes
      </button>
      <button className="prompt-button" onClick={onDeclineInsurance}>
        No
      </button>
      {!canAffordInsurance && (
        <p className="prompt-warning">Not enough chips available for insurance.</p>
      )}
    </div>
  );
};

export default InsurancePrompt;
