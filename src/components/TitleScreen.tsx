import React from 'react';
import { motion } from 'framer-motion';
import aceHearts from '../assets/cards/HEART-1.svg';
import kingSpades from '../assets/cards/SPADE-13.svg';
import queenDiamonds from '../assets/cards/DIAMOND-12.svg';
import cardBack from '../assets/cards/back.svg';
import chip1 from '../assets/chips/3D/CHIP-1.png';
import chip5 from '../assets/chips/3D/CHIP-5.png';
import chip10 from '../assets/chips/3D/CHIP-10.png';
import chip25 from '../assets/chips/3D/CHIP-25.png';
import chip100 from '../assets/chips/3D/CHIP-100.png';
import chip500 from '../assets/chips/3D/CHIP-500.png';
import chip1000 from '../assets/chips/3D/CHIP-1000.png';
import { formatDisplayAmount } from '../utils/gameLogic';

interface TitleScreenProps {
  onStart: () => void;
}

type ChipValue = 1 | 5 | 10 | 25 | 100 | 500 | 1000;

interface ChipPlacement {
  value: ChipValue;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}

const heroCards = [
  {
    src: cardBack,
    alt: 'Face-down playing card',
    className:
      'left-[52%] top-[50.6%] w-[10.9%] min-w-[4.8em] -translate-x-[166%] rotate-[-15deg] opacity-42',
  },
  {
    src: queenDiamonds,
    alt: 'Queen of diamonds',
    className:
      'left-[52%] top-[48.2%] w-[11.3%] min-w-[5em] -translate-x-[108%] rotate-[-6deg] opacity-60',
  },
  {
    src: aceHearts,
    alt: 'Ace of hearts',
    className:
      'left-[52%] top-[47%] w-[12.2%] min-w-[5.5em] -translate-x-1/2 rotate-[1deg] opacity-76',
  },
  {
    src: kingSpades,
    alt: 'King of spades',
    className:
      'left-[52%] top-[48.2%] w-[11.3%] min-w-[5em] translate-x-[14%] rotate-[8deg] opacity-60',
  },
];

const chipImages: Record<ChipValue, string> = {
  1: chip1,
  5: chip5,
  10: chip10,
  25: chip25,
  100: chip100,
  500: chip500,
  1000: chip1000,
};

const DEFAULT_CHIP_LAYOUT: ChipPlacement[] = [
  { value: 25, x: 88.6, y: 76.7, size: 4.3, rotation: 15.6, opacity: 0.46 },
  { value: 5, x: 12.7, y: 60.3, size: 3.2, rotation: -17.8, opacity: 0.28 },
  { value: 10, x: 71.4, y: 59.4, size: 3.1, rotation: 6.9, opacity: 0.26 },
  { value: 500, x: 22.5, y: 49.5, size: 3.2, rotation: -0.4, opacity: 0.3 },
  { value: 100, x: 84.8, y: 51.1, size: 3.7, rotation: 11.4, opacity: 0.36 },
  { value: 1, x: 15.7, y: 76.3, size: 5.2, rotation: -12.5, opacity: 0.56 },
];

const baseButton =
  'inline-flex items-center justify-center rounded border px-[1.1em] py-[0.55em] text-[0.54em] font-bold uppercase tracking-[0.18em] transition-colors duration-150';
const primaryButton =
  'border-red-700 bg-red-700 text-white hover:bg-red-600 active:bg-red-800 shadow-[0_10px_30px_rgba(0,0,0,0.3)]';

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between px-[4%] border-b border-white/[0.08] bg-black/20"
        style={{ height: '11%' }}
      >
        <div className="flex flex-col gap-[0.15em]">
          <span className="text-white/40 text-[0.32em] font-bold tracking-[0.2em] uppercase">
            Balance
          </span>
          <span className="text-white text-[0.88em] font-bold leading-none">
            <span className="text-red-500">$</span>
            {formatDisplayAmount(1000)}
          </span>
        </div>

        <span className="text-white/20 text-[0.36em] tracking-[0.3em] uppercase font-bold">
          Blackjack
        </span>
      </div>

      <div className="absolute inset-x-0 top-[11%] bottom-[22%] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,255,255,0.055),transparent_24%,rgba(0,0,0,0.11)_72%,transparent_100%)]" />
          <div className="absolute left-1/2 top-[49%] h-[42%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.045),rgba(255,255,255,0.015)_36%,rgba(0,0,0,0)_74%)] blur-3xl" />
          <div className="absolute left-1/2 top-[42%] h-[18%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04),rgba(255,255,255,0.01)_42%,rgba(0,0,0,0)_76%)] blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          {heroCards.map((card, index) => (
            <motion.img
              key={card.alt}
              src={card.src}
              alt={card.alt}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + index * 0.08,
                duration: 0.35,
                ease: 'easeOut',
              }}
              className={`absolute h-auto object-contain drop-shadow-2xl ${card.className}`}
            />
          ))}
        </motion.div>

        {DEFAULT_CHIP_LAYOUT.map((chip, index) => (
          <img
            key={`chip-${index}`}
            src={chipImages[chip.value]}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-xl"
            style={{
              left: `${chip.x}%`,
              top: `${chip.y}%`,
              width: `${chip.size}%`,
              minWidth: '1.8em',
              opacity: chip.opacity,
              transform: `translate(-50%, -50%) rotate(${chip.rotation}deg)`,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.32, ease: 'easeOut' }}
          className="absolute left-1/2 top-[31%] z-10 flex w-[min(34em,74%)] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
        >
          <p className="m-0 text-[0.34em] font-bold uppercase tracking-[0.32em] text-red-400">
            Classic Rules
          </p>
          <h1 className="mt-[0.2em] mb-0 text-[2.35em] font-bold uppercase leading-[0.9] tracking-[0.18em] text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.5)]">
            Blackjack
          </h1>
          <div className="mt-[0.65em] flex items-center gap-[0.75em] opacity-75" aria-hidden="true">
            <span className="h-px w-[3.3em] bg-white/18" />
            <span className="h-[0.42em] w-[0.42em] rotate-45 bg-red-500/75" />
            <span className="h-px w-[3.3em] bg-white/18" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.22, duration: 0.32, ease: 'easeOut' }}
          className="absolute left-1/2 top-[66%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-[0.6em]">
            <button type="button" className={`${baseButton} ${primaryButton}`} onClick={onStart}>
              Start Game
            </button>
          </div>
        </motion.div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 border-t border-white/[0.08] bg-black/26"
        style={{ height: '22%' }}
      />
    </div>
  );
};

export default TitleScreen;
