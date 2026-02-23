import React from 'react';

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center p-8 bg-black/80 backdrop-blur-md z-[1000]">
      <div className="relative w-full max-w-md p-8 border border-white/10 rounded-lg bg-neutral-900 shadow-2xl">
        <div className="mb-2 text-red-400 text-xs font-bold tracking-wider uppercase">
          Game Over
        </div>

        <h1 className="m-0 text-white font-bold text-4xl leading-tight">Out of Chips</h1>

        <p className="mt-3 text-white/50 text-base leading-relaxed">
          You've run out of chips. Buy back in to continue playing.
        </p>

        <div className="w-full h-px my-6 bg-white/10" />

        <button
          className="w-full px-6 py-3 border border-red-700 rounded bg-red-700 text-white font-bold text-sm uppercase hover:bg-red-600 transition-colors"
          onClick={onRestart}
        >
          Buy Back In
        </button>
      </div>
    </div>
  );
};

export default GameOver;
