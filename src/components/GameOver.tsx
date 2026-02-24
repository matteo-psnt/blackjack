import React from 'react';

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center p-[1.5em] bg-black/80 backdrop-blur-md z-[1000]">
      <div className="relative w-full max-w-[20em] p-[1.5em] border border-white/10 rounded-lg bg-neutral-900 shadow-2xl">
        <div className="mb-[0.3em] text-red-400 text-[0.42em] font-bold tracking-wider uppercase">
          Game Over
        </div>

        <h1 className="m-0 text-white font-bold text-[1.5em] leading-tight">Out of Chips</h1>

        <p className="mt-[0.5em] mb-0 text-white/50 text-[0.6em] leading-relaxed">
          You've run out of chips. Buy back in to continue playing.
        </p>

        <div className="w-full h-px my-[1em] bg-white/10" />

        <button
          className="w-full px-[1em] py-[0.5em] border border-red-700 rounded bg-red-700 text-white font-bold text-[0.58em] uppercase hover:bg-red-600 transition-colors"
          onClick={onRestart}
        >
          Buy Back In
        </button>
      </div>
    </div>
  );
};

export default GameOver;
