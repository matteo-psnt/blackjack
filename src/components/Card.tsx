import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Card.css';
import blank from '../assets/cards/blank.svg';
import back from '../assets/cards/back.svg';
import { CardRank, CardSuit } from './enums';
import { CardAnimation } from './enums';

const cardImages = import.meta.glob('../assets/cards/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

interface CardProps {
  rank: CardRank;
  suit: CardSuit;
  style?: React.CSSProperties;
  isFlipped?: boolean;
  animation?: CardAnimation;
}

// Animation variants for different card animations
const animations = {
  slideDown: {
    initial: { y: '-50%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  slideUp: {
    initial: { y: '50%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  slideRight: {
    initial: { x: '-72.5%' },
    animate: { x: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  slideLeft: {
    initial: { x: '72.5%' },
    animate: { x: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  slideDownRight: {
    initial: { x: '-59.5%', y: '-18%' },
    animate: { x: 0, y: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  doubleDown: {
    initial: { x: '50%', y: '-150%', rotate: 0, opacity: 0 },
    animate: { x: 0, y: 0, rotate: 90, opacity: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const Card: React.FC<CardProps> = ({ rank, suit, style, isFlipped, animation }) => {
  const getImage = () => {
    if (isFlipped) return blank;
    return cardImages[`../assets/cards/${suit}-${rank.toString()}.svg`] ?? blank;
  };

  // Get animation config based on CardAnimation enum
  const getAnimationConfig = () => {
    switch (animation) {
      case CardAnimation.SlideDown:
        return animations.slideDown;
      case CardAnimation.SlideUp:
        return animations.slideUp;
      case CardAnimation.SlideRight:
        return animations.slideRight;
      case CardAnimation.SlideLeft:
        return animations.slideLeft;
      case CardAnimation.SlideDownRight:
        return animations.slideDownRight;
      case CardAnimation.DoubleDown:
        return animations.doubleDown;
      default:
        return null;
    }
  };

  const animConfig = getAnimationConfig();

  return (
    <motion.div
      className="card-container"
      style={style}
      initial={animConfig?.initial}
      animate={animConfig?.animate}
      transition={animConfig?.transition}
    >
      <div className={`card ${isFlipped ? 'flipped' : ''}`}>
        <img
          className="front"
          src={getImage()}
          alt={isFlipped ? 'Card Back' : `${rank} of ${suit}`}
        />
        <img className="back" src={back} alt="Card Back" />
      </div>
    </motion.div>
  );
};

export default Card;
