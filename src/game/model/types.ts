import type { CSSProperties } from 'react';
import { CardAnimation, CardRank, CardSuit } from './enums';

export interface Card {
  rank: CardRank;
  suit: CardSuit;
  isFlipped?: boolean;
  animation?: CardAnimation;
  style?: CSSProperties;
}

export type HandOutcome = 'bust' | 'lose' | 'push' | 'win' | 'blackjack';
