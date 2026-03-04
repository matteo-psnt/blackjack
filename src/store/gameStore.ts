import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CardRank, CardSuit, GameState, PlayState, CardAnimation } from '../components/enums';
import Deck from '../components/Deck';

export interface Card {
  rank: CardRank;
  suit: CardSuit;
  isFlipped?: boolean;
  animation?: CardAnimation;
  style?: React.CSSProperties;
}

interface GameStore {
  // State
  deck: Deck;
  playerCards: Card[][];
  dealerCards: Card[];
  handBets: number[];
  totalWagered: number;
  currentFocus: number;
  currentBet: number;
  currentBalance: number;
  gameState: GameState;
  playState: PlayState;
  showGameOver: boolean;
  showDebug: boolean;

  // Actions
  setPlayerCards: (cards: Card[][]) => void;
  setDealerCards: (cards: Card[]) => void;
  setHandBets: (bets: number[]) => void;
  setTotalWagered: (amount: number) => void;
  setCurrentFocus: (focus: number) => void;
  setCurrentBet: (bet: number) => void;
  setCurrentBalance: (balance: number) => void;
  setGameState: (state: GameState) => void;
  setPlayState: (state: PlayState) => void;
  setShowGameOver: (show: boolean) => void;
  setShowDebug: (show: boolean) => void;

  // Game actions
  addPlayerCard: (focusIndex: number) => void;
  addDealerCard: (isFlipped: boolean) => void;
  updateCurrentBet: (newBet: number) => void;
  handleChipClick: (chipValue: number) => void;
  restartGame: () => void;
  initializeDeck: () => void;
  split: () => void;
  double: () => void;
  hit: () => void;
  stand: () => void;
  moveFocus: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      deck: new Deck(),
      playerCards: [],
      dealerCards: [],
      handBets: [],
      totalWagered: 0,
      currentFocus: 0,
      currentBet: 100,
      currentBalance: 900,
      gameState: GameState.Betting,
      playState: PlayState.None,
      showGameOver: false,
      showDebug: typeof window !== 'undefined'
        ? localStorage.getItem('blackjack-debug') === 'true'
        : false,

  // Simple setters
  setPlayerCards: (cards) => set({ playerCards: cards }, false, 'setPlayerCards'),
  setDealerCards: (cards) => set({ dealerCards: cards }, false, 'setDealerCards'),
  setHandBets: (bets) => set({ handBets: bets }, false, 'setHandBets'),
  setTotalWagered: (amount) => set({ totalWagered: amount }, false, 'setTotalWagered'),
  setCurrentFocus: (focus) => set({ currentFocus: focus }, false, 'setCurrentFocus'),
  setCurrentBet: (bet) => set({ currentBet: bet }, false, 'setCurrentBet'),
  setCurrentBalance: (balance) => set({ currentBalance: balance }, false, 'setCurrentBalance'),
  setGameState: (state) => set({ gameState: state }, false, 'setGameState'),
  setPlayState: (state) => set({ playState: state }, false, 'setPlayState'),
  setShowGameOver: (show) => set({ showGameOver: show }, false, 'setShowGameOver'),
  setShowDebug: (show) => {
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('blackjack-debug', String(show));
    }
    set({ showDebug: show }, false, 'setShowDebug');
  },

  // Initialize deck
  initializeDeck: () => {
    const { deck } = get();
    deck.shuffle();
  },

  // Add card to player hand
  addPlayerCard: (focusIndex) => {
    const { deck, playerCards } = get();
    const newCard = deck.dealCard();
    if (newCard) {
      const newPlayerCards = [...playerCards];
      if (!newPlayerCards[focusIndex]) {
        newPlayerCards[focusIndex] = [];
      }
      newPlayerCards[focusIndex] = [
        ...newPlayerCards[focusIndex],
        { ...newCard, animation: CardAnimation.SlideDown },
      ];
      set({ playerCards: newPlayerCards }, false, 'addPlayerCard');
    }
  },

  // Add card to dealer hand
  addDealerCard: (isFlipped) => {
    const { deck, dealerCards } = get();
    const newCard = deck.dealCard();
    if (newCard) {
      set({
        dealerCards: [
          ...dealerCards,
          { ...newCard, animation: CardAnimation.SlideUp, isFlipped },
        ],
      }, false, 'addDealerCard');
    }
  },

  // Update bet amount
  updateCurrentBet: (newBet) => {
    const { currentBet, currentBalance } = get();
    const betDifference = newBet - currentBet;
    const newBalance = currentBalance - betDifference;

    if (newBet >= 0 && newBalance >= 0) {
      set({ currentBet: newBet, currentBalance: newBalance }, false, 'updateCurrentBet');
    }
  },

  // Handle chip click
  handleChipClick: (chipValue) => {
    const { currentBet, currentBalance } = get();
    set({
      currentBet: currentBet - chipValue,
      currentBalance: currentBalance + chipValue,
    }, false, 'handleChipClick');
  },

  // Restart game
  restartGame: () => {
    const { deck } = get();
    deck.initializeDeck(6);
    deck.shuffle();
    set({
      playerCards: [],
      dealerCards: [],
      handBets: [],
      totalWagered: 0,
      currentFocus: 0,
      currentBet: 100,
      currentBalance: 900,
      gameState: GameState.Betting,
      playState: PlayState.None,
      showGameOver: false,
    }, false, 'restartGame');
  },

  // Move focus to next hand
  moveFocus: () => {
    const { currentFocus } = get();
    if (currentFocus <= 0) {
      set({ gameState: GameState.DealerPlay, currentFocus: -1 }, false, 'moveFocus');
    } else {
      set({ currentFocus: currentFocus - 1 }, false, 'moveFocus');
    }
  },

  // Hit action
  hit: () => {
    const { currentFocus, addPlayerCard } = get();
    addPlayerCard(currentFocus);
  },

  // Stand action
  stand: () => {
    const { moveFocus } = get();
    moveFocus();
  },

  // Split action
  split: () => {
    const { handBets, currentFocus, currentBalance, totalWagered, playerCards } = get();
    const splitBet = handBets[currentFocus];

    // Update balance and wagered amount
    set({
      currentBalance: currentBalance - splitBet,
      totalWagered: totalWagered + splitBet,
      gameState: GameState.Animation,
    }, false, 'split:start');

    // Update bets
    const newBets = [...handBets];
    newBets.splice(currentFocus, 1, splitBet, splitBet);
    set({ handBets: newBets }, false, 'split:updateBets');

    // Split cards
    let newCards = [...playerCards];
    if (newCards[currentFocus] && newCards[currentFocus].length === 2) {
      newCards = newCards.map((cardGroup, index) => {
        const animation =
          index < currentFocus ? CardAnimation.SlideLeft : CardAnimation.SlideRight;
        return cardGroup.map((card) => ({ ...card, animation }));
      });

      const [cardLeft, cardRight] = newCards[currentFocus];
      newCards.splice(currentFocus, 1);
      newCards.splice(
        currentFocus,
        0,
        [{ ...cardLeft, animation: CardAnimation.SlideLeft }],
        [{ ...cardRight, animation: CardAnimation.SlideDownRight }],
      );
    }
    set({ playerCards: newCards }, false, 'split:animateCards');

    // Clear animations and deal new cards
    setTimeout(() => {
      const currentCards = get().playerCards;
      set({
        playerCards: currentCards.map((cardGroup) =>
          cardGroup.map((card) => ({ ...card, animation: undefined })),
        ),
      }, false, 'split:clearAnimations');
    }, 1000);

    setTimeout(() => get().addPlayerCard(currentFocus), 1500);
    setTimeout(() => get().addPlayerCard(currentFocus + 1), 2000);
    set({ currentFocus: currentFocus + 1 }, false, 'split:updateFocus');
    setTimeout(() => set({ gameState: GameState.Play }, false, 'split:complete'), 2500);
  },

  // Double down action
  double: () => {
    const { handBets, currentFocus, currentBalance, totalWagered, deck, playerCards } =
      get();
    const additionalBet = handBets[currentFocus];

    // Update balance and wagered amount
    set({
      currentBalance: currentBalance - additionalBet,
      totalWagered: totalWagered + additionalBet,
    }, false, 'double:updateBalance');

    // Double the bet
    const newBets = [...handBets];
    newBets[currentFocus] = newBets[currentFocus] * 2;
    set({ handBets: newBets }, false, 'double:updateBet');

    // Deal card
    const newCard = deck.dealCard();
    if (newCard) {
      const newCards = [...playerCards];
      if (!newCards[currentFocus]) {
        newCards[currentFocus] = [];
      }
      newCards[currentFocus] = [
        ...newCards[currentFocus],
        {
          ...newCard,
          animation: CardAnimation.DoubleDown,
          isFlipped: true,
          style: { transform: `rotate(90deg)`, left: `32%` },
        },
      ];
      set({ playerCards: newCards }, false, 'double:dealCard');
    }

    setTimeout(() => get().moveFocus(), 1000);
  },
    }),
    { name: 'Blackjack Game' }
  )
);
