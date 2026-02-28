import React from 'react';
import { GameState } from './enums';
import '../styles/InsurancePrompt.css';

interface InsurancePromptProps {
  gameState: GameState;
  setGameState: (newState: GameState) => void;
  setCurrentBalance: (newBalance: number) => void;
  currentBalance: number;
  betAmount: number;
  dealerHas21: boolean;
}

const InsurancePrompt: React.FC<InsurancePromptProps> = ({
  gameState,
  setGameState,
  setCurrentBalance,
  currentBalance,
  betAmount,
  dealerHas21,
}) => {
  if (gameState !== GameState.Insurance) {
    return null;
  }

  const buyInsurance = () => {
    const insuranceBet = Math.floor(betAmount / 2);

    if (dealerHas21) {
      // Insurance pays 2:1, so net result is: pay insuranceBet, get back 2x = +insuranceBet net
      setCurrentBalance(currentBalance + insuranceBet);
      setGameState(GameState.DealerPlay);
    } else {
      // Lose the insurance bet
      setCurrentBalance(currentBalance - insuranceBet);
      setGameState(GameState.Play);
    }
  };

  const declineInsurance = () => {
    if (dealerHas21) {
      setGameState(GameState.DealerPlay);
    } else {
      setGameState(GameState.Play);
    }
  };

  return (
    <div className="prompt-container">
      <p>Do you want to buy insurance?</p>
      <button className="prompt-button" onClick={buyInsurance}>
        Yes
      </button>
      <button className="prompt-button" onClick={declineInsurance}>
        No
      </button>
    </div>
  );
};

export default InsurancePrompt;
