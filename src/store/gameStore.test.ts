import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Deck from '../components/Deck';
import { CardRank, CardSuit, GameState, PlayState } from '../components/enums';
import { useGameStore } from './gameStore';

const resetStore = () => {
  localStorage.removeItem('blackjack-debug');
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

  it('clamps unaffordable bet increases to the maximum whole-dollar bankroll', () => {
    useGameStore.setState({
      currentBet: 10,
      currentBalance: 90.5,
    });

    useGameStore.getState().updateCurrentBet(200);

    const state = useGameStore.getState();
    expect(state.currentBet).toBe(100);
    expect(state.currentBalance).toBe(0.5);
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
    expect(state.insuranceBet).toBe(7);
    expect(state.currentBalance).toBe(93);
    expect(state.gameState).toBe(GameState.DealerPlay);
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
    expect(state.currentBalance).toBe(800);
    expect(state.handBets).toEqual([]);
    expect(state.totalWagered).toBe(0);
    expect(state.gameState).toBe(GameState.Betting);
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
    expect(state.currentBalance).toBe(102.5);
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
    expect(state.currentBalance).toBe(80);
  });

  it('pays insurance only on a natural dealer blackjack and then re-stages the next bet', () => {
    useGameStore.setState({
      currentBet: 15,
      currentBalance: 93,
      insuranceBet: 7,
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
    expect(state.currentBalance).toBe(99);
    expect(state.insuranceBet).toBe(0);
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
});
