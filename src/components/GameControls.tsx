import React from 'react';
import { GameState, PlayState } from './enums';

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
  const base = 'px-5 py-2 text-sm font-bold uppercase rounded border transition-all duration-150';
  const primary = 'border-red-700 bg-red-700 text-white hover:bg-red-600 active:bg-red-800';
  const secondary =
    'border-white/40 bg-transparent text-white hover:border-white/65 hover:bg-white/[0.05]';
  const disabled = 'border-white/15 bg-transparent text-white/25 cursor-not-allowed';

  function buttons() {
    if (gameState === GameState.Betting) {
      return (
        <button
          id="deal-button"
          onClick={deal}
          disabled={!canDeal}
          className={`${base} ${canDeal ? primary : disabled}`}
        >
          Deal
        </button>
      );
    } else if (gameState === GameState.Play) {
      if (playState === PlayState.Normal) {
        return (
          <>
            <button onClick={hit} className={`${base} ${primary}`}>
              Hit
            </button>
            <button onClick={stand} className={`${base} ${secondary}`}>
              Stand
            </button>
            <button
              onClick={double}
              disabled={!canDouble}
              className={`${base} ${canDouble ? secondary : disabled}`}
            >
              Double
            </button>
          </>
        );
      } else if (playState === PlayState.CanSplit) {
        return (
          <>
            <button
              onClick={split}
              disabled={!canSplit}
              className={`${base} ${canSplit ? secondary : disabled}`}
            >
              Split
            </button>
            <button onClick={hit} className={`${base} ${primary}`}>
              Hit
            </button>
            <button onClick={stand} className={`${base} ${secondary}`}>
              Stand
            </button>
            <button
              onClick={double}
              disabled={!canDouble}
              className={`${base} ${canDouble ? secondary : disabled}`}
            >
              Double
            </button>
          </>
        );
      } else if (playState === PlayState.Post || playState === PlayState.Split) {
        return (
          <>
            <button onClick={hit} className={`${base} ${primary}`}>
              Hit
            </button>
            <button onClick={stand} className={`${base} ${secondary}`}>
              Stand
            </button>
          </>
        );
      }
    }
  }

  return <div className="flex justify-end gap-2">{buttons()}</div>;
};

export default GameControls;
