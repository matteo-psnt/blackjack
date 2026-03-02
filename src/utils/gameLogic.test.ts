import { describe, expect, it } from 'vitest';
import { CardRank, CardSuit } from '../game/model';
import {
  formatDisplayAmount,
  getHandOutcome,
  getHandValue,
  getInsuranceCost,
  getNetAmount,
  getNetColor,
  getOutcomeBadgeClasses,
  getOutcomeLabel,
  getRankGameValue,
  getResolvedHandValue,
  getVisibleHandValue,
} from './gameLogic';

const card = (rank: CardRank, isFlipped = false) => ({
  rank,
  suit: CardSuit.Spades,
  isFlipped,
});

// ─── getRankGameValue ──────────────────────────────────────────────────────────

describe('getRankGameValue', () => {
  it('returns the numeric value for number cards', () => {
    expect(getRankGameValue(CardRank.Two)).toBe(2);
    expect(getRankGameValue(CardRank.Seven)).toBe(7);
    expect(getRankGameValue(CardRank.Ten)).toBe(10);
  });

  it('caps face cards at 10', () => {
    expect(getRankGameValue(CardRank.Jack)).toBe(10);
    expect(getRankGameValue(CardRank.Queen)).toBe(10);
    expect(getRankGameValue(CardRank.King)).toBe(10);
  });

  it('returns 1 for Ace (raw rank before soft/hard logic)', () => {
    expect(getRankGameValue(CardRank.Ace)).toBe(1);
  });
});

// ─── getHandValue ──────────────────────────────────────────────────────────────

describe('getHandValue', () => {
  it('sums a basic hand with no aces', () => {
    expect(getHandValue([card(CardRank.Seven), card(CardRank.Eight)])).toBe(15);
  });

  it('counts an ace as 11 when it keeps the hand at 21 or under', () => {
    expect(getHandValue([card(CardRank.Ace), card(CardRank.Seven)])).toBe(18);
  });

  it('counts an ace as 1 when 11 would bust', () => {
    expect(getHandValue([card(CardRank.Ace), card(CardRank.Seven), card(CardRank.Six)])).toBe(14);
  });

  it('handles two aces: one as 11, one as 1', () => {
    expect(getHandValue([card(CardRank.Ace), card(CardRank.Ace)])).toBe(12);
  });

  it('handles three aces: all count as 1', () => {
    expect(getHandValue([card(CardRank.Ace), card(CardRank.Ace), card(CardRank.Ace)])).toBe(13);
  });

  it('returns 21 for a natural blackjack hand', () => {
    expect(getHandValue([card(CardRank.Ace), card(CardRank.King)])).toBe(21);
  });

  it('excludes flipped (hidden) cards by default', () => {
    expect(getHandValue([card(CardRank.Ten), card(CardRank.Six, true)])).toBe(10);
  });

  it('includes flipped cards when includeHiddenCards is true', () => {
    expect(getHandValue([card(CardRank.Ten), card(CardRank.Six, true)], true)).toBe(16);
  });

  it('correctly handles a hidden ace when cards are revealed', () => {
    expect(getHandValue([card(CardRank.Ten), card(CardRank.Ace, true)], true)).toBe(21);
  });
});

// ─── getVisibleHandValue / getResolvedHandValue ────────────────────────────────

describe('getVisibleHandValue', () => {
  it('excludes hidden cards', () => {
    expect(getVisibleHandValue([card(CardRank.Ten), card(CardRank.Eight, true)])).toBe(10);
  });
});

describe('getResolvedHandValue', () => {
  it('includes hidden cards', () => {
    expect(getResolvedHandValue([card(CardRank.Ten), card(CardRank.Eight, true)])).toBe(18);
  });
});

// ─── getInsuranceCost ─────────────────────────────────────────────────────────

describe('getInsuranceCost', () => {
  it('returns half the bet for a round number', () => {
    expect(getInsuranceCost(20)).toBe(10);
  });

  it('rounds to the nearest half dollar', () => {
    expect(getInsuranceCost(15)).toBe(7.5);
  });

  it('returns 0 for a zero bet', () => {
    expect(getInsuranceCost(0)).toBe(0);
  });

  it('returns 0 for a negative bet', () => {
    expect(getInsuranceCost(-10)).toBe(0);
  });
});

// ─── formatDisplayAmount ──────────────────────────────────────────────────────

describe('formatDisplayAmount', () => {
  it('returns integers as strings without a decimal', () => {
    expect(formatDisplayAmount(100)).toBe('100');
    expect(formatDisplayAmount(0)).toBe('0');
  });

  it('returns floats formatted to two decimal places', () => {
    expect(formatDisplayAmount(7.5)).toBe('7.50');
    expect(formatDisplayAmount(107.5)).toBe('107.50');
  });
});

// ─── getHandOutcome ───────────────────────────────────────────────────────────

describe('getHandOutcome', () => {
  const hand = (ranks: CardRank[]) => ranks.map((r) => card(r));

  it('returns bust when player exceeds 21', () => {
    expect(
      getHandOutcome(
        hand([CardRank.Ten, CardRank.King, CardRank.Five]),
        hand([CardRank.Seven, CardRank.Eight]),
        1,
      ),
    ).toBe('bust');
  });

  it('returns blackjack for a natural player blackjack against a non-blackjack dealer', () => {
    expect(
      getHandOutcome(hand([CardRank.Ace, CardRank.King]), hand([CardRank.Ten, CardRank.Nine]), 1),
    ).toBe('blackjack');
  });

  it('returns push when both player and dealer have natural blackjack', () => {
    expect(
      getHandOutcome(hand([CardRank.Ace, CardRank.King]), hand([CardRank.Ace, CardRank.Queen]), 1),
    ).toBe('push');
  });

  it('returns lose when dealer has a natural blackjack and player does not', () => {
    expect(
      getHandOutcome(hand([CardRank.Ten, CardRank.Nine]), hand([CardRank.Ace, CardRank.King]), 1),
    ).toBe('lose');
  });

  it('returns win when the dealer busts', () => {
    expect(
      getHandOutcome(
        hand([CardRank.Ten, CardRank.Eight]),
        hand([CardRank.Ten, CardRank.Six, CardRank.Nine]),
        1,
      ),
    ).toBe('win');
  });

  it('returns win when player score beats dealer', () => {
    expect(
      getHandOutcome(hand([CardRank.Ten, CardRank.Nine]), hand([CardRank.Ten, CardRank.Seven]), 1),
    ).toBe('win');
  });

  it('returns push when scores are equal and neither has a natural blackjack', () => {
    expect(
      getHandOutcome(hand([CardRank.Ten, CardRank.Eight]), hand([CardRank.Ten, CardRank.Eight]), 1),
    ).toBe('push');
  });

  it('returns lose when dealer score beats player', () => {
    expect(
      getHandOutcome(hand([CardRank.Ten, CardRank.Six]), hand([CardRank.Ten, CardRank.Nine]), 1),
    ).toBe('lose');
  });

  it('treats 21 in 2 cards as a regular win (not blackjack) when from a split hand', () => {
    expect(
      getHandOutcome(hand([CardRank.Ace, CardRank.King]), hand([CardRank.Ten, CardRank.Eight]), 2),
    ).toBe('win');
  });
});

// ─── getNetAmount ─────────────────────────────────────────────────────────────

describe('getNetAmount', () => {
  it('returns 1.5x the bet for blackjack', () => {
    expect(getNetAmount('blackjack', 10)).toBe(15);
  });

  it('returns 1x the bet for a win', () => {
    expect(getNetAmount('win', 10)).toBe(10);
  });

  it('returns 0 for a push', () => {
    expect(getNetAmount('push', 10)).toBe(0);
  });

  it('returns negative bet for a loss', () => {
    expect(getNetAmount('lose', 10)).toBe(-10);
  });

  it('returns negative bet for a bust', () => {
    expect(getNetAmount('bust', 10)).toBe(-10);
  });
});

// ─── getOutcomeLabel ──────────────────────────────────────────────────────────

describe('getOutcomeLabel', () => {
  it.each([
    ['win', 'Win'],
    ['blackjack', 'Blackjack'],
    ['push', 'Push'],
    ['bust', 'Bust'],
    ['lose', 'Lose'],
  ] as const)('returns %s label for %s outcome', (outcome, label) => {
    expect(getOutcomeLabel(outcome)).toBe(label);
  });
});

// ─── getOutcomeBadgeClasses ───────────────────────────────────────────────────

describe('getOutcomeBadgeClasses', () => {
  it('returns emerald classes for win', () => {
    expect(getOutcomeBadgeClasses('win')).toContain('emerald');
  });

  it('returns yellow classes for blackjack', () => {
    expect(getOutcomeBadgeClasses('blackjack')).toContain('yellow');
  });

  it('returns muted white classes for push', () => {
    expect(getOutcomeBadgeClasses('push')).toContain('white');
  });

  it('returns red classes for bust', () => {
    expect(getOutcomeBadgeClasses('bust')).toContain('red');
  });

  it('returns red classes for lose', () => {
    expect(getOutcomeBadgeClasses('lose')).toContain('red');
  });
});

// ─── getNetColor ──────────────────────────────────────────────────────────────

describe('getNetColor', () => {
  it('returns emerald for win', () => {
    expect(getNetColor('win')).toContain('emerald');
  });

  it('returns emerald for blackjack', () => {
    expect(getNetColor('blackjack')).toContain('emerald');
  });

  it('returns muted white for push', () => {
    expect(getNetColor('push')).toContain('white');
  });

  it('returns red for bust', () => {
    expect(getNetColor('bust')).toContain('red');
  });

  it('returns red for lose', () => {
    expect(getNetColor('lose')).toContain('red');
  });
});
