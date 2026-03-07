import { CardRank, type Card, type HandOutcome } from '../game/model';

type ValuedCard = Pick<Card, 'rank' | 'isFlipped'>;

export const getRankGameValue = (rank: CardRank) => Math.min(10, rank);

export const getHandValue = (hand: ValuedCard[], includeHiddenCards = false) => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (!card.isFlipped || includeHiddenCards) {
      if (card.rank === CardRank.Ace) {
        aces += 1;
      }

      value += Math.min(10, card.rank);
    }
  }

  while (value <= 11 && aces > 0) {
    value += 10;
    aces -= 1;
  }

  return value;
};

export const getVisibleHandValue = (hand: ValuedCard[]) => getHandValue(hand);

export const getResolvedHandValue = (hand: ValuedCard[]) => getHandValue(hand, true);

export const getInsuranceCost = (betAmount: number) =>
  Math.round((Math.max(0, betAmount) / 2) * 2) / 2;

export const formatDisplayAmount = (amount: number) =>
  Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);

export const getHandOutcome = (
  playerHand: ValuedCard[],
  dealerCards: ValuedCard[],
  totalPlayerHands: number,
): HandOutcome => {
  const playerValue = getResolvedHandValue(playerHand);
  const dealerValue = getResolvedHandValue(dealerCards);
  const dealerHasBlackjack = dealerCards.length === 2 && dealerValue === 21;
  const isNaturalBlackjack =
    playerValue === 21 && playerHand.length === 2 && totalPlayerHands === 1;

  if (playerValue > 21) return 'bust';
  if (isNaturalBlackjack) return dealerHasBlackjack ? 'push' : 'blackjack';
  if (dealerHasBlackjack) return 'lose';
  if (dealerValue > 21 || playerValue > dealerValue) return 'win';
  if (playerValue === dealerValue) return 'push';
  return 'lose';
};

export const getNetAmount = (outcome: HandOutcome, bet: number): number => {
  switch (outcome) {
    case 'blackjack':
      return bet * 1.5;
    case 'win':
      return bet;
    case 'push':
      return 0;
    default:
      return -bet;
  }
};

export const getOutcomeLabel = (outcome: HandOutcome): string => {
  switch (outcome) {
    case 'win':
      return 'Win';
    case 'blackjack':
      return 'Blackjack';
    case 'push':
      return 'Push';
    case 'bust':
      return 'Bust';
    default:
      return 'Lose';
  }
};

export const getOutcomeBadgeClasses = (outcome: HandOutcome): string => {
  switch (outcome) {
    case 'win':
      return 'border-2 border-emerald-500 bg-emerald-600 text-white';
    case 'blackjack':
      return 'border-2 border-yellow-400 bg-yellow-500 text-black';
    case 'push':
      return 'border border-white/30 bg-black/60 text-white/60';
    default:
      return 'border-2 border-red-600 bg-red-700 text-white';
  }
};

export const getNetColor = (outcome: HandOutcome): string => {
  switch (outcome) {
    case 'win':
    case 'blackjack':
      return 'text-emerald-400';
    case 'push':
      return 'text-white/50';
    default:
      return 'text-red-400';
  }
};
