import React from 'react';
import { GameState, PlayState } from './enums';
import '../styles/GameControls.css';

interface GameControlsProps {
  hit: () => void;
  stand: () => void;
  split: () => void;
  double: () => void;
  deal: () => void;
  gameState: GameState;
  playState: PlayState;
  canDeal: boolean;
  canDouble: boolean;
  canSplit: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  hit,
  stand,
  split,
  double,
  deal,
  gameState,
  playState,
  canDeal,
  canDouble,
  canSplit,
}) => {
  function buttons() {
    if (gameState === GameState.Betting) {
      return (
        <button id="deal-button" onClick={deal} disabled={!canDeal}>
          Deal
        </button>
      );
    } else if (gameState === GameState.Play) {
      if (playState === PlayState.Normal) {
        return (
          <>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
            <button onClick={double} disabled={!canDouble}>
              Double
            </button>
          </>
        );
      } else if (playState === PlayState.CanSplit) {
        return (
          <>
            <button onClick={split} disabled={!canSplit}>
              Split
            </button>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
            <button onClick={double} disabled={!canDouble}>
              Double
            </button>
          </>
        );
      } else if (playState === PlayState.Post || playState === PlayState.Split) {
        return (
          <>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </>
        );
      }
    }
  }

  return <div className="player-controls">{buttons()}</div>;
};

export default GameControls;
