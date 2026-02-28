import React from 'react';
import '../styles/GameOver.css';

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  return (
    <div className="gameover-overlay">
      <div className="gameover-container">
        <div className="gameover-title">Game Over</div>
        <div className="gameover-message">You're out of chips!</div>
        <div className="gameover-subtext">Better luck next time.</div>
        <button className="restart-button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
