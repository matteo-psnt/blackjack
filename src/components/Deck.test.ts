import Deck from './Deck';
import { CardRank, CardSuit } from './enums';

function serializeCard(card: unknown): string {
  return JSON.stringify(card);
}

function countCards(cards: unknown[]): Map<string, number> {
  return cards.reduce((counts, card) => {
    const key = serializeCard(card);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

describe('Deck', () => {
  it('builds a full shoe from the exported rank and suit enums', () => {
    const numberOfDecks = 2;
    const deck = new Deck(numberOfDecks);
    const suits = Object.values(CardSuit);
    const ranks = Object.values(CardRank).filter(
      (value): value is number => typeof value === 'number',
    );

    expect(deck.deck).toHaveLength(suits.length * ranks.length * numberOfDecks);

    const cardCounts = countCards(deck.deck);
    expect(cardCounts.size).toBe(suits.length * ranks.length);

    for (const count of cardCounts.values()) {
      expect(count).toBe(numberOfDecks);
    }
  });

  it('deals cards until the shoe is empty', () => {
    const deck = new Deck(1);
    const initialLength = deck.deck.length;

    expect(deck.dealCard()).toBeDefined();
    expect(deck.deck).toHaveLength(initialLength - 1);

    while (deck.dealCard()) {
      // Exhaust the shoe one card at a time.
    }

    expect(deck.dealCard()).toBeUndefined();
  });

  it('shuffles in place without changing the cards in the shoe', () => {
    const deck = new Deck(1);
    const beforeShuffle = [...deck.deck].map(serializeCard).sort();

    deck.shuffle();

    const afterShuffle = [...deck.deck].map(serializeCard).sort();
    expect(afterShuffle).toEqual(beforeShuffle);
  });
});
