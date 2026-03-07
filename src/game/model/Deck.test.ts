import { describe, expect, it } from 'vitest';
import Deck from './Deck';
import { CardRank, CardSuit } from './enums';

describe('Deck', () => {
  it('creates a standard six-deck shoe', () => {
    const deck = new Deck();
    expect(deck.deck).toHaveLength(312);
  });

  it('includes every card rank and suit combination', () => {
    const deck = new Deck(1);
    expect(deck.deck).toContainEqual({ rank: CardRank.Ace, suit: CardSuit.Spades });
    expect(deck.deck).toContainEqual({ rank: CardRank.King, suit: CardSuit.Hearts });
  });

  it('deals cards from the deck', () => {
    const deck = new Deck(1);
    const initialSize = deck.deck.length;

    const card = deck.dealCard();

    expect(card).toBeDefined();
    expect(deck.deck).toHaveLength(initialSize - 1);
  });
});
