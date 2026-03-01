import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CardRank, CardSuit, Deck, GameState, PlayState } from '../game/model';
import { getInsuranceCost, useGameStore } from './gameStore';

const resetStore = () => {
  if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
    localStorage.removeItem('blackjack-debug');
  }

  useGameStore.getState().restartGame();
  useGameStore.setState({
    playerCards: [],
    dealerCards: [],
    handBets: [],
    totalWagered: 0,
    currentFocus: 0,
    insuranceBet: 0,
    gameState: GameState.Betting,
    playState: PlayState.None,
    showGameOver: false,
  });
};

describe('gameStore bankroll logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('clamps a bet increase to the floor of the available balance without touching the balance', () => {
    useGameStore.setState({
      currentBet: 10,
      currentBalance: 90.5,
    });

    useGameStore.getState().updateCurrentBet(200);

    const state = useGameStore.getState();
    // In the new model the max affordable bet is floor(balance), not floor(balance+bet).
    expect(state.currentBet).toBe(90);
    expect(state.currentBalance).toBe(90.5);
  });

  it('does not allow chip clicks to push the staged bet below zero', () => {
    useGameStore.setState({
      currentBet: 5,
      currentBalance: 95,
    });

    useGameStore.getState().handleChipClick(10);

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(5);
    expect(state.currentBalance).toBe(95);
  });

  it('deducts insurance immediately and routes dealer blackjack through dealer play', () => {
    useGameStore.setState({
      currentBet: 15,
      currentBalance: 100,
      dealerCards: [
        { rank: CardRank.Ace, suit: CardSuit.Spades },
        { rank: CardRank.King, suit: CardSuit.Hearts, isFlipped: true },
      ],
      gameState: GameState.Insurance,
    });

    useGameStore.getState().resolveInsuranceDecision(true);

    const state = useGameStore.getState();
    expect(state.insuranceBet).toBe(7.5);
    expect(state.currentBalance).toBe(92.5);
    expect(state.gameState).toBe(GameState.DealerPlay);
  });

  it('calculates insurance as an exact half-bet, including half dollars', () => {
    expect(getInsuranceCost(15)).toBe(7.5);
    expect(getInsuranceCost(20)).toBe(10);
  });

  it('refuses insurance purchases the bankroll cannot cover', () => {
    useGameStore.setState({
      currentBet: 20,
      currentBalance: 5,
      dealerCards: [
        { rank: CardRank.Ace, suit: CardSuit.Spades },
        { rank: CardRank.King, suit: CardSuit.Hearts, isFlipped: true },
      ],
      gameState: GameState.Insurance,
    });

    useGameStore.getState().resolveInsuranceDecision(true);

    const state = useGameStore.getState();
    expect(state.insuranceBet).toBe(0);
    expect(state.currentBalance).toBe(5);
    expect(state.gameState).toBe(GameState.Insurance);
  });

  it('blocks split when the bankroll cannot cover the extra wager', () => {
    useGameStore.setState({
      currentBalance: 5,
      currentFocus: 0,
      handBets: [10],
      gameState: GameState.Play,
      playState: PlayState.CanSplit,
      playerCards: [
        [
          { rank: CardRank.Eight, suit: CardSuit.Clubs },
          { rank: CardRank.Eight, suit: CardSuit.Diamonds },
        ],
      ],
      totalWagered: 10,
    });

    useGameStore.getState().split();

    const state = useGameStore.getState();
    expect(state.handBets).toEqual([10]);
    expect(state.currentBalance).toBe(5);
    expect(state.totalWagered).toBe(10);
  });

  it('blocks double when the bankroll cannot cover the extra wager', () => {
    useGameStore.setState({
      currentBalance: 5,
      currentFocus: 0,
      handBets: [10],
      gameState: GameState.Play,
      playState: PlayState.Normal,
      playerCards: [
        [
          { rank: CardRank.Five, suit: CardSuit.Clubs },
          { rank: CardRank.Six, suit: CardSuit.Diamonds },
        ],
      ],
      totalWagered: 10,
    });

    useGameStore.getState().double();

    const state = useGameStore.getState();
    expect(state.handBets).toEqual([10]);
    expect(state.currentBalance).toBe(5);
    expect(state.totalWagered).toBe(10);
    expect(state.playerCards[0]).toHaveLength(2);
  });

  it('settles a lost hand and re-stages the same wager for the next round', () => {
    // currentBalance is already post-deal (deal deducted the bet).
    useGameStore.setState({
      currentBet: 100,
      currentBalance: 900,
      handBets: [100],
      playerCards: [
        [
          { rank: CardRank.Ten, suit: CardSuit.Clubs },
          { rank: CardRank.Six, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Spades },
        { rank: CardRank.Queen, suit: CardSuit.Diamonds },
      ],
      gameState: GameState.WrapUp,
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(100);
    // Loss: no payout. Balance stays at the post-deal value; the next bet is
    // NOT pre-deducted — it will be taken at the next deal.
    expect(state.currentBalance).toBe(900);
    expect(state.handBets).toEqual([]);
    expect(state.totalWagered).toBe(0);
    expect(state.gameState).toBe(GameState.Betting);
  });

  it('skips dealer play when the final hand has already busted', () => {
    useGameStore.setState({
      currentFocus: 0,
      gameState: GameState.Play,
      playerCards: [
        [
          { rank: CardRank.King, suit: CardSuit.Clubs },
          { rank: CardRank.Queen, suit: CardSuit.Hearts },
          { rank: CardRank.Five, suit: CardSuit.Spades },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Diamonds },
        { rank: CardRank.Six, suit: CardSuit.Clubs, isFlipped: true },
      ],
    });

    useGameStore.getState().moveFocus();

    const state = useGameStore.getState();
    expect(state.currentFocus).toBe(-1);
    expect(state.gameState).toBe(GameState.Results);
  });

  it('pays blackjack exactly for odd-dollar wagers', () => {
    useGameStore.setState({
      currentBet: 5,
      currentBalance: 95,
      handBets: [5],
      playerCards: [
        [
          { rank: CardRank.Ace, suit: CardSuit.Clubs },
          { rank: CardRank.King, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Spades },
        { rank: CardRank.Nine, suit: CardSuit.Diamonds },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(5);
    // Blackjack pays 1.5× (5 × 1.5 = 7.5 net profit). Full lump returned: 95 + 12.5 = 107.5.
    expect(state.currentBalance).toBe(107.5);
  });

  it('pays player blackjack when dealer reaches 21 without a natural blackjack', () => {
    useGameStore.setState({
      currentBet: 10,
      currentBalance: 90,
      handBets: [10],
      playerCards: [
        [
          { rank: CardRank.Ace, suit: CardSuit.Clubs },
          { rank: CardRank.King, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Seven, suit: CardSuit.Spades },
        { rank: CardRank.Five, suit: CardSuit.Diamonds },
        { rank: CardRank.Nine, suit: CardSuit.Clubs },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(10);
    // Dealer 21 with 3 cards is not a natural; player BJ still pays 2.5×. 90 + 25 = 115.
    expect(state.currentBalance).toBe(115);
  });

  it('pushes when both player and dealer have natural blackjack', () => {
    useGameStore.setState({
      currentBet: 10,
      currentBalance: 90,
      handBets: [10],
      playerCards: [
        [
          { rank: CardRank.Ace, suit: CardSuit.Clubs },
          { rank: CardRank.King, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ace, suit: CardSuit.Spades },
        { rank: CardRank.Queen, suit: CardSuit.Diamonds },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(10);
    // Push returns the original stake. 90 + 10 = 100.
    expect(state.currentBalance).toBe(100);
  });

  it('includes the hidden double-down card when settling the round', () => {
    useGameStore.setState({
      currentBet: 10,
      currentBalance: 90,
      handBets: [20],
      playerCards: [
        [
          { rank: CardRank.Ten, suit: CardSuit.Clubs },
          { rank: CardRank.Eight, suit: CardSuit.Hearts },
          { rank: CardRank.Five, suit: CardSuit.Spades, isFlipped: true },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Diamonds },
        { rank: CardRank.Six, suit: CardSuit.Clubs },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(10);
    // Player busted; no payout. Balance remains at the post-deal value. 90 + 0 = 90.
    expect(state.currentBalance).toBe(90);
  });

  it('pays insurance only on a natural dealer blackjack and then re-stages the next bet', () => {
    useGameStore.setState({
      currentBet: 15,
      currentBalance: 92.5,
      insuranceBet: 7.5,
      handBets: [15],
      playerCards: [
        [
          { rank: CardRank.Ten, suit: CardSuit.Clubs },
          { rank: CardRank.Six, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ace, suit: CardSuit.Spades },
        { rank: CardRank.King, suit: CardSuit.Diamonds, isFlipped: false },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(15);
    // Insurance pays 3× (7.5 × 3 = 22.5). Main hand lost. 92.5 + 22.5 = 115.
    expect(state.currentBalance).toBe(115);
    expect(state.insuranceBet).toBe(0);
  });

  it('allows splitting equal-value ten cards', () => {
    useGameStore.setState({
      currentBalance: 90,
      currentFocus: 0,
      handBets: [10],
      gameState: GameState.Play,
      playState: PlayState.CanSplit,
      playerCards: [
        [
          { rank: CardRank.Ten, suit: CardSuit.Clubs },
          { rank: CardRank.Queen, suit: CardSuit.Hearts },
        ],
      ],
      totalWagered: 10,
    });

    useGameStore.getState().split();

    const state = useGameStore.getState();
    expect(state.handBets).toEqual([10, 10]);
    expect(state.currentBalance).toBe(80);
    expect(state.totalWagered).toBe(20);
    expect(state.gameState).toBe(GameState.Animation);
  });

  it('deals only the active split hand before returning control', () => {
    const deck = new Deck(0);
    const dealCard = vi.spyOn(deck, 'dealCard').mockReturnValueOnce({
      rank: CardRank.Three,
      suit: CardSuit.Spades,
    });

    useGameStore.setState({
      deck,
      currentBalance: 90,
      currentFocus: 0,
      handBets: [10],
      gameState: GameState.Play,
      playState: PlayState.CanSplit,
      playerCards: [
        [
          { rank: CardRank.Eight, suit: CardSuit.Clubs },
          { rank: CardRank.Eight, suit: CardSuit.Diamonds },
        ],
      ],
      totalWagered: 10,
    });

    useGameStore.getState().split();

    let state = useGameStore.getState();
    expect(state.playerCards).toHaveLength(2);
    expect(state.playerCards[0]).toHaveLength(1);
    expect(state.playerCards[1]).toHaveLength(1);
    expect(state.currentFocus).toBe(1);
    expect(state.gameState).toBe(GameState.Animation);

    vi.advanceTimersByTime(1499);

    expect(dealCard).not.toHaveBeenCalled();
    state = useGameStore.getState();
    expect(state.playerCards[0]).toHaveLength(1);
    expect(state.playerCards[1]).toHaveLength(1);

    vi.advanceTimersByTime(1);

    state = useGameStore.getState();
    expect(dealCard).toHaveBeenCalledTimes(1);
    expect(state.playerCards[0]).toHaveLength(1);
    expect(state.playerCards[1]).toHaveLength(2);
    expect(state.gameState).toBe(GameState.Animation);

    vi.advanceTimersByTime(500);

    expect(useGameStore.getState().gameState).toBe(GameState.Play);
  });

  it('deals the waiting split hand when focus advances to it', () => {
    const deck = new Deck(0);
    const dealCard = vi.spyOn(deck, 'dealCard').mockReturnValueOnce({
      rank: CardRank.Four,
      suit: CardSuit.Hearts,
    });

    useGameStore.setState({
      deck,
      currentBalance: 80,
      currentFocus: 1,
      handBets: [10, 10],
      gameState: GameState.Play,
      playState: PlayState.Split,
      playerCards: [
        [{ rank: CardRank.Eight, suit: CardSuit.Clubs }],
        [
          { rank: CardRank.Eight, suit: CardSuit.Diamonds },
          { rank: CardRank.Three, suit: CardSuit.Spades },
        ],
      ],
      totalWagered: 20,
    });

    useGameStore.getState().moveFocus();

    let state = useGameStore.getState();
    expect(state.currentFocus).toBe(0);
    expect(state.gameState).toBe(GameState.Animation);
    expect(state.playerCards[0]).toHaveLength(1);

    vi.advanceTimersByTime(499);

    expect(dealCard).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    state = useGameStore.getState();
    expect(dealCard).toHaveBeenCalledTimes(1);
    expect(state.playerCards[0]).toHaveLength(2);
    expect(state.playerCards[1]).toHaveLength(2);
    expect(state.gameState).toBe(GameState.Animation);

    vi.advanceTimersByTime(500);

    expect(useGameStore.getState().gameState).toBe(GameState.Play);
  });

  it('stages no bet and shows game over when less than one dollar remains', () => {
    useGameStore.setState({
      currentBet: 1,
      currentBalance: 0.5,
      handBets: [1],
      playerCards: [
        [
          { rank: CardRank.Ten, suit: CardSuit.Clubs },
          { rank: CardRank.Six, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Spades },
        { rank: CardRank.Queen, suit: CardSuit.Diamonds },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(0);
    expect(state.currentBalance).toBe(0.5);
    expect(state.showGameOver).toBe(true);
  });

  it('adds the extra card and wager when a double is affordable', () => {
    const deck = new Deck(0);
    vi.spyOn(deck, 'dealCard').mockReturnValue({
      rank: CardRank.Five,
      suit: CardSuit.Spades,
    });

    useGameStore.setState({
      deck,
      currentBalance: 20,
      currentFocus: 0,
      handBets: [10],
      gameState: GameState.Play,
      playState: PlayState.Normal,
      playerCards: [
        [
          { rank: CardRank.Five, suit: CardSuit.Clubs },
          { rank: CardRank.Six, suit: CardSuit.Diamonds },
        ],
      ],
      totalWagered: 10,
    });

    useGameStore.getState().double();

    const state = useGameStore.getState();
    expect(state.currentBalance).toBe(10);
    expect(state.handBets).toEqual([20]);
    expect(state.totalWagered).toBe(20);
    expect(state.playerCards[0]).toHaveLength(3);
    expect(state.playerCards[0][2]).toMatchObject({
      rank: CardRank.Five,
      suit: CardSuit.Spades,
      isFlipped: true,
    });
  });

  it('blocks double after a split hand even if it is still a pair', () => {
    useGameStore.setState({
      currentBalance: 40,
      currentFocus: 1,
      handBets: [10, 10],
      gameState: GameState.Play,
      playState: PlayState.CanSplit,
      playerCards: [
        [
          { rank: CardRank.Five, suit: CardSuit.Clubs },
          { rank: CardRank.Seven, suit: CardSuit.Diamonds },
        ],
        [
          { rank: CardRank.Eight, suit: CardSuit.Hearts },
          { rank: CardRank.Eight, suit: CardSuit.Spades },
        ],
      ],
      totalWagered: 20,
    });

    useGameStore.getState().double();

    const state = useGameStore.getState();
    expect(state.handBets).toEqual([10, 10]);
    expect(state.currentBalance).toBe(40);
    expect(state.totalWagered).toBe(20);
    expect(state.playerCards[1]).toHaveLength(2);
  });

  // ─── New-model balance tests ──────────────────────────────────────────────

  it('deducts the bet from the balance when the deal begins', () => {
    useGameStore.setState({
      currentBet: 100,
      currentBalance: 1000,
      gameState: GameState.Betting,
      deck: new Deck(),
    });

    useGameStore.getState().beginDeal();

    const state = useGameStore.getState();
    expect(state.currentBalance).toBe(900);
    expect(state.handBets).toEqual([100]);
    expect(state.gameState).toBe(GameState.Dealing);
  });

  it('adjusting the staged bet leaves the balance untouched', () => {
    useGameStore.setState({
      currentBet: 50,
      currentBalance: 500,
    });

    useGameStore.getState().updateCurrentBet(150);

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(150);
    expect(state.currentBalance).toBe(500);
  });

  it('caps a new bet at the floor of the current balance, not the sum of balance plus old bet', () => {
    useGameStore.setState({
      currentBet: 50,
      currentBalance: 130.99,
    });

    useGameStore.getState().updateCurrentBet(999);

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(130);
    expect(state.currentBalance).toBe(130.99);
  });

  it('returns stake plus profit in full on a regular win without pre-deducting the next bet', () => {
    // Simulate post-deal state: $100 was deducted from $1000 at deal time.
    useGameStore.setState({
      currentBet: 100,
      currentBalance: 900,
      handBets: [100],
      playerCards: [
        [
          { rank: CardRank.Ten, suit: CardSuit.Clubs },
          { rank: CardRank.King, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Seven, suit: CardSuit.Spades },
        { rank: CardRank.Nine, suit: CardSuit.Diamonds },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    // Player 20 vs dealer 16: win. payout = 100 × 2 = 200. 900 + 200 = 1100.
    expect(state.currentBalance).toBe(1100);
    expect(state.currentBet).toBe(100);
    expect(state.gameState).toBe(GameState.Betting);
  });

  it('leaves the balance unchanged at resolution on a loss since the stake was already deducted at deal', () => {
    useGameStore.setState({
      currentBet: 100,
      currentBalance: 900,
      handBets: [100],
      playerCards: [
        [
          { rank: CardRank.Seven, suit: CardSuit.Clubs },
          { rank: CardRank.Eight, suit: CardSuit.Hearts },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Spades },
        { rank: CardRank.King, suit: CardSuit.Diamonds },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    // Player 15 vs dealer 20: loss. No payout. Balance stays at post-deal value.
    expect(state.currentBalance).toBe(900);
    expect(state.gameState).toBe(GameState.Betting);
  });

  it('settles multiple split hands and pools all payouts in one resolution', () => {
    useGameStore.setState({
      currentBet: 10,
      currentBalance: 880, // post-deal ($10) and post-split ($10) deductions already applied
      handBets: [10, 10],
      totalWagered: 20,
      playerCards: [
        [
          { rank: CardRank.Nine, suit: CardSuit.Clubs },
          { rank: CardRank.Ten, suit: CardSuit.Hearts },
        ],
        [
          { rank: CardRank.King, suit: CardSuit.Diamonds },
          { rank: CardRank.Eight, suit: CardSuit.Spades },
        ],
      ],
      dealerCards: [
        { rank: CardRank.Ten, suit: CardSuit.Clubs },
        { rank: CardRank.Six, suit: CardSuit.Hearts },
      ],
    });

    useGameStore.getState().finalizeRound();

    const state = useGameStore.getState();
    // Hand 1 (19) wins vs dealer 16: payout = 10 × 2 = 20.
    // Hand 2 (18) wins vs dealer 16: payout = 10 × 2 = 20.
    // Total: 880 + 40 = 920.
    expect(state.currentBalance).toBe(920);
    expect(state.currentBet).toBe(10);
  });
});
