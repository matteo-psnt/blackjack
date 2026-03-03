import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CardAnimation, Deck, GameState, PlayState, type Card } from '../game/model';
import { getRankGameValue, getResolvedHandValue, getInsuranceCost } from '../utils/gameLogic';

const DEFAULT_BANKROLL = 1000;
const DEFAULT_STAGED_BET = 100;

interface GameStore {
  deck: Deck;
  playerCards: Card[][];
  dealerCards: Card[];
  handBets: number[];
  totalWagered: number;
  currentFocus: number;
  currentBet: number;
  currentBalance: number;
  insuranceBet: number;
  gameState: GameState;
  playState: PlayState;
  showGameOver: boolean;
  setPlayerCards: (cards: Card[][]) => void;
  setDealerCards: (cards: Card[]) => void;
  setHandBets: (bets: number[]) => void;
  setTotalWagered: (amount: number) => void;
  setCurrentFocus: (focus: number) => void;
  setCurrentBet: (bet: number) => void;
  setCurrentBalance: (balance: number) => void;
  setInsuranceBet: (bet: number) => void;
  setGameState: (state: GameState) => void;
  setPlayState: (state: PlayState) => void;
  setShowGameOver: (show: boolean) => void;
  initializeDeck: () => void;
  beginDeal: () => void;
  addPlayerCard: (focusIndex: number) => void;
  addDealerCard: (isFlipped: boolean) => void;
  updateCurrentBet: (newBet: number) => void;
  handleChipClick: (chipValue: number) => void;
  restartGame: () => void;
  split: () => void;
  double: () => void;
  hit: () => void;
  stand: () => void;
  moveFocus: () => void;
  resolveInsuranceDecision: (buyInsurance: boolean) => void;
  finalizeRound: () => void;
}

const roundToHalfDollar = (amount: number) => Math.round(amount * 2) / 2;

const toWholeDollar = (amount: number) => {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.max(0, Math.floor(amount));
};

const createShuffledDeck = () => {
  const deck = new Deck();
  deck.shuffle();
  return deck;
};

const getNextStagedBet = (preferredBet: number, availableBalance: number) => {
  const maxAffordableBet = Math.max(0, Math.floor(availableBalance));
  return Math.min(toWholeDollar(preferredBet), maxAffordableBet);
};

const isBustedHand = (hand: Card[] = []) => getResolvedHandValue(hand) > 21;

const areAllHandsBusted = (hands: Card[][]) => hands.length > 0 && hands.every(isBustedHand);

const getInitialState = () => ({
  deck: createShuffledDeck(),
  playerCards: [] as Card[][],
  dealerCards: [] as Card[],
  handBets: [] as number[],
  totalWagered: 0,
  currentFocus: 0,
  currentBet: DEFAULT_STAGED_BET,
  currentBalance: DEFAULT_BANKROLL,
  insuranceBet: 0,
  gameState: GameState.Betting,
  playState: PlayState.None,
  showGameOver: false,
});

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => {
      const queueSplitHandDeal = (
        focusIndex: number,
        cardDelay: number,
        resumeDelay: number,
        actionPrefix: string,
      ) => {
        setTimeout(() => get().addPlayerCard(focusIndex), cardDelay);
        setTimeout(
          () => set({ gameState: GameState.Play }, false, `${actionPrefix}:complete`),
          resumeDelay,
        );
      };

      return {
        ...getInitialState(),
        setPlayerCards: (cards) => set({ playerCards: cards }, false, 'setPlayerCards'),
        setDealerCards: (cards) => set({ dealerCards: cards }, false, 'setDealerCards'),
        setHandBets: (bets) => set({ handBets: bets }, false, 'setHandBets'),
        setTotalWagered: (amount) =>
          set({ totalWagered: roundToHalfDollar(amount) }, false, 'setTotalWagered'),
        setCurrentFocus: (focus) => set({ currentFocus: focus }, false, 'setCurrentFocus'),
        setCurrentBet: (bet) => set({ currentBet: toWholeDollar(bet) }, false, 'setCurrentBet'),
        setCurrentBalance: (balance) =>
          set(
            { currentBalance: Math.max(0, roundToHalfDollar(balance)) },
            false,
            'setCurrentBalance',
          ),
        setInsuranceBet: (bet) =>
          set({ insuranceBet: Math.max(0, roundToHalfDollar(bet)) }, false, 'setInsuranceBet'),
        setGameState: (state) => set({ gameState: state }, false, 'setGameState'),
        setPlayState: (state) => set({ playState: state }, false, 'setPlayState'),
        setShowGameOver: (show) => set({ showGameOver: show }, false, 'setShowGameOver'),
        initializeDeck: () => set({ deck: createShuffledDeck() }, false, 'initializeDeck'),
        beginDeal: () => {
          const { currentBet, currentBalance } = get();

          if (currentBet <= 0) {
            return;
          }

          set(
            {
              playerCards: [],
              dealerCards: [],
              handBets: [currentBet],
              totalWagered: currentBet,
              currentFocus: 0,
              insuranceBet: 0,
              playState: PlayState.None,
              gameState: GameState.Dealing,
              showGameOver: false,
              currentBalance: roundToHalfDollar(currentBalance - currentBet),
            },
            false,
            'beginDeal',
          );
        },
        addPlayerCard: (focusIndex) => {
          const { deck, playerCards } = get();
          const newCard = deck.dealCard();

          if (!newCard) {
            return;
          }

          const nextPlayerCards = [...playerCards];

          if (!nextPlayerCards[focusIndex]) {
            nextPlayerCards[focusIndex] = [];
          }

          nextPlayerCards[focusIndex] = [
            ...nextPlayerCards[focusIndex],
            { ...newCard, animation: CardAnimation.SlideDown },
          ];

          set({ playerCards: nextPlayerCards }, false, 'addPlayerCard');
        },
        addDealerCard: (isFlipped) => {
          const { deck, dealerCards } = get();
          const newCard = deck.dealCard();

          if (!newCard) {
            return;
          }

          set(
            {
              dealerCards: [
                ...dealerCards,
                { ...newCard, animation: CardAnimation.SlideUp, isFlipped },
              ],
            },
            false,
            'addDealerCard',
          );
        },
        updateCurrentBet: (newBet) => {
          const { currentBet, currentBalance } = get();
          const maxAffordableBet = Math.max(0, Math.floor(currentBalance));
          const nextBet = Math.min(toWholeDollar(newBet), maxAffordableBet);

          if (nextBet === currentBet) {
            return;
          }

          set({ currentBet: nextBet }, false, 'updateCurrentBet');
        },
        handleChipClick: (chipValue) => {
          const { currentBet } = get();

          if (chipValue <= 0 || chipValue > currentBet) {
            return;
          }

          set({ currentBet: currentBet - chipValue }, false, 'handleChipClick');
        },
        restartGame: () => set(getInitialState(), false, 'restartGame'),
        split: () => {
          const { currentBalance, currentFocus, gameState, handBets, playState, playerCards } =
            get();
          const currentHand = playerCards[currentFocus];
          const splitBet = handBets[currentFocus] ?? 0;
          const canSplitHand =
            playState === PlayState.CanSplit &&
            gameState === GameState.Play &&
            currentHand !== undefined &&
            currentHand.length === 2 &&
            getRankGameValue(currentHand[0].rank) === getRankGameValue(currentHand[1].rank) &&
            playerCards.length < 4 &&
            splitBet > 0 &&
            currentBalance >= splitBet;

          if (!canSplitHand) {
            return;
          }

          const nextBets = [...handBets];
          nextBets.splice(currentFocus, 1, splitBet, splitBet);

          const animatedCards = playerCards.map((cardGroup, index) => {
            const animation =
              index < currentFocus ? CardAnimation.SlideLeft : CardAnimation.SlideRight;
            return cardGroup.map((card) => ({ ...card, animation }));
          });

          const [cardLeft, cardRight] = animatedCards[currentFocus];
          animatedCards.splice(
            currentFocus,
            1,
            [{ ...cardLeft, animation: CardAnimation.SlideLeft }],
            [{ ...cardRight, animation: CardAnimation.SlideDownRight }],
          );

          set(
            {
              currentBalance: roundToHalfDollar(currentBalance - splitBet),
              handBets: nextBets,
              totalWagered: roundToHalfDollar(get().totalWagered + splitBet),
              playerCards: animatedCards,
              currentFocus: currentFocus + 1,
              playState: PlayState.None,
              gameState: GameState.Animation,
            },
            false,
            'split:start',
          );

          setTimeout(() => {
            const currentCards = get().playerCards;
            set(
              {
                playerCards: currentCards.map((cardGroup) =>
                  cardGroup.map((card) => ({ ...card, animation: undefined })),
                ),
              },
              false,
              'split:clearAnimations',
            );
          }, 1000);

          queueSplitHandDeal(currentFocus + 1, 1500, 2000, 'split');
        },
        double: () => {
          const {
            currentBalance,
            currentFocus,
            deck,
            gameState,
            handBets,
            playState,
            playerCards,
            totalWagered,
          } = get();
          const currentHand = playerCards[currentFocus];
          const additionalBet = handBets[currentFocus] ?? 0;
          const canDoubleHand =
            gameState === GameState.Play &&
            (playState === PlayState.Normal || playState === PlayState.CanSplit) &&
            currentHand !== undefined &&
            playerCards.length === 1 &&
            currentHand.length === 2 &&
            additionalBet > 0 &&
            currentBalance >= additionalBet;

          if (!canDoubleHand) {
            return;
          }

          const nextBets = [...handBets];
          nextBets[currentFocus] = nextBets[currentFocus] * 2;

          set(
            {
              currentBalance: roundToHalfDollar(currentBalance - additionalBet),
              handBets: nextBets,
              totalWagered: roundToHalfDollar(totalWagered + additionalBet),
            },
            false,
            'double:updateBalance',
          );

          const newCard = deck.dealCard();

          if (newCard) {
            const nextCards = [...playerCards];

            if (!nextCards[currentFocus]) {
              nextCards[currentFocus] = [];
            }

            nextCards[currentFocus] = [
              ...nextCards[currentFocus],
              {
                ...newCard,
                animation: CardAnimation.DoubleDown,
                isFlipped: true,
                style: { transform: 'rotate(90deg)', left: '32%' },
              },
            ];

            set({ playerCards: nextCards }, false, 'double:dealCard');
          }

          setTimeout(() => get().moveFocus(), 1000);
        },
        hit: () => {
          const { addPlayerCard, currentFocus } = get();
          addPlayerCard(currentFocus);
        },
        stand: () => {
          get().moveFocus();
        },
        moveFocus: () => {
          const { currentFocus, playerCards } = get();

          if (currentFocus <= 0) {
            const nextGameState = areAllHandsBusted(playerCards)
              ? GameState.Results
              : GameState.DealerPlay;
            set({ currentFocus: -1, gameState: nextGameState }, false, 'moveFocus');
            return;
          }

          const nextFocus = currentFocus - 1;
          const nextHand = playerCards[nextFocus];

          if (nextHand?.length === 1) {
            set(
              {
                currentFocus: nextFocus,
                playState: PlayState.None,
                gameState: GameState.Animation,
              },
              false,
              'moveFocus:dealSplitHand',
            );
            queueSplitHandDeal(nextFocus, 500, 1000, 'moveFocus:dealSplitHand');
            return;
          }

          set({ currentFocus: nextFocus }, false, 'moveFocus');
        },
        resolveInsuranceDecision: (buyInsurance) => {
          const { currentBalance, currentBet, dealerCards } = get();
          const insuranceCost = getInsuranceCost(currentBet);
          const dealerHasBlackjack =
            dealerCards.length === 2 && getResolvedHandValue(dealerCards) === 21;

          if (buyInsurance) {
            if (insuranceCost <= 0 || currentBalance < insuranceCost) {
              return;
            }

            set(
              {
                currentBalance: roundToHalfDollar(currentBalance - insuranceCost),
                insuranceBet: insuranceCost,
                gameState: dealerHasBlackjack ? GameState.DealerPlay : GameState.Play,
              },
              false,
              'insurance:buy',
            );
            return;
          }

          set(
            {
              insuranceBet: 0,
              gameState: dealerHasBlackjack ? GameState.DealerPlay : GameState.Play,
            },
            false,
            'insurance:decline',
          );
        },
        finalizeRound: () => {
          const { currentBalance, currentBet, dealerCards, handBets, insuranceBet, playerCards } =
            get();
          const dealerValue = getResolvedHandValue(dealerCards);
          const dealerHasBlackjack = dealerCards.length === 2 && dealerValue === 21;

          let mainPayout = 0;

          playerCards.forEach((hand, index) => {
            const handBet = handBets[index] ?? 0;
            const playerValue = getResolvedHandValue(hand);
            const playerHasBlackjack =
              playerValue === 21 && hand.length === 2 && playerCards.length === 1;

            if (playerValue > 21) {
              return;
            }

            if (playerHasBlackjack) {
              mainPayout += dealerHasBlackjack ? handBet : handBet * 2.5;
              return;
            }

            if (dealerHasBlackjack) {
              return;
            }

            if (dealerValue > 21 || playerValue > dealerValue) {
              mainPayout += handBet * 2;
              return;
            }

            if (playerValue === dealerValue) {
              mainPayout += handBet;
            }
          });

          const insurancePayout = insuranceBet > 0 && dealerHasBlackjack ? insuranceBet * 3 : 0;
          const availableBalance = roundToHalfDollar(currentBalance + mainPayout + insurancePayout);
          const nextBet = getNextStagedBet(currentBet, availableBalance);
          const nextBalance = availableBalance;

          set(
            {
              playerCards: [],
              dealerCards: [],
              handBets: [],
              totalWagered: 0,
              currentFocus: 0,
              currentBet: nextBet,
              currentBalance: nextBalance,
              insuranceBet: 0,
              gameState: GameState.Betting,
              playState: PlayState.None,
              showGameOver: nextBet === 0,
            },
            false,
            'finalizeRound',
          );
        },
      };
    },
    { name: 'Blackjack Game' },
  ),
);

export {
  getHandValue,
  getVisibleHandValue,
  getResolvedHandValue,
  getInsuranceCost,
} from '../utils/gameLogic';
