import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
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
// Using variants for better control with animate prop
const cardVariants = {
  // Initial dealing animations
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

  // Split animations - cards are already in new position, animate FROM old position
  // slideRight: for hands to the RIGHT of split, they move right to make room
  slideRight: {
    initial: { x: '-72.5%' },  // Start from left (old position)
    animate: { x: 0 },           // End at current position (moved right)
    transition: { type: 'spring', stiffness: 120, damping: 25 },
  },
  // slideLeft: the LEFT split card, starts at center, ends at left
  slideLeft: {
    initial: { x: '72.5%' },   // Start from right (where center was)
    animate: { x: 0 },          // End at current position (left hand)
    transition: { type: 'spring', stiffness: 120, damping: 25 },
  },

  // slideDownRight: the RIGHT split card, starts at center, ends at right-down
  slideDownRight: {
    initial: { x: '-59.5%', y: '-18%' },  // Start from left-up (where center was)
    animate: { x: 0, y: 0 },               // End at current position (right hand)
    transition: { type: 'spring', stiffness: 120, damping: 25 },
  },

  // Double down
  doubleDown: {
    initial: { x: '50%', y: '-150%', rotate: 0, opacity: 0 },
    animate: { x: 0, y: 0, rotate: 90, opacity: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const Card: React.FC<CardProps> = ({ rank, suit, style, isFlipped, animation }) => {
  const controls = useAnimation();

  const getImage = () => {
    if (isFlipped) return blank;
    return cardImages[`../assets/cards/${suit}-${rank.toString()}.svg`] ?? blank;
  };

  // Get animation config
  const getAnimationConfig = () => {
    switch (animation) {
      case CardAnimation.SlideDown:
        return cardVariants.slideDown;
      case CardAnimation.SlideUp:
        return cardVariants.slideUp;
      case CardAnimation.SlideRight:
        return cardVariants.slideRight;
      case CardAnimation.SlideLeft:
        return cardVariants.slideLeft;
      case CardAnimation.SlideDownRight:
        return cardVariants.slideDownRight;
      case CardAnimation.DoubleDown:
        return cardVariants.doubleDown;
      default:
        return null;
    }
  };

  // Trigger animation when animation prop changes
  useEffect(() => {
    const animConfig = getAnimationConfig();
    if (animation && animConfig) {
      // Set initial position instantly, then animate to final position
      if (animConfig.initial) {
        controls.set(animConfig.initial);
      }
      controls.start(animConfig.animate, animConfig.transition);
    }
  }, [animation, controls]);

  return (
    <motion.div
      className="card-container"
      style={style}
      animate={controls}
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
