import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import BettingControls from './BettingControls';
import GameControls from './GameControls';
import InsurancePrompt from './InsurancePrompt';
import GameOver from './GameOver';
import DebugPanel from './DebugPanel';
import { useDebugStore } from '../store/debugStore';
import { CardAnimation, CardRank, GameState, PlayState } from '../game/model';
import {
  getInsuranceCost,
  getResolvedHandValue,
  getVisibleHandValue,
  useGameStore,
} from '../store/gameStore';
import {
  formatDisplayAmount,
  getHandOutcome,
  getNetAmount,
  getOutcomeLabel,
  getOutcomeBadgeClasses,
  getNetColor,
  getRankGameValue,
} from '../utils/gameLogic';
import { useBalanceCounter } from '../hooks/useBalanceCounter';

const getBustCollectionTarget = (cardIndex: number, handSize: number) => ({
  x: `${(handSize - 1) * 10 - cardIndex * 20}%`,
  y: `${cardIndex * 18}%`,
  rotate: 0,
  delay: cardIndex * 0.05,
});

const introEase = [0.22, 1, 0.36, 1] as const;
const introItem = (delay: number, y = 10) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.34, ease: introEase },
});

const introScale = (delay: number) => ({
  initial: { opacity: 0, scaleX: 0.96 },
  animate: { opacity: 1, scaleX: 1 },
  transition: { delay, duration: 0.38, ease: introEase },
});

const DEALER_STACK_START_LEFT = 5.5;
const DEALER_CARD_SPACING = 24;

const Game = () => {
  const {
    playerCards,
    dealerCards,
    handBets,
    currentFocus,
    currentBet,
    totalWagered,
    currentBalance,
    gameState,
    playState,
    showGameOver,
    deck,
    setPlayerCards,
    setDealerCards,
    setGameState,
    setPlayState,
    addPlayerCard,
    addDealerCard,
    updateCurrentBet,
    restartGame,
    initializeDeck,
    beginDeal,
    hit,
    stand,
    split,
    double,
    moveFocus,
    resolveInsuranceDecision,
    finalizeRound,
  } = useGameStore();
  const { paused: debugPaused } = useDebugStore();

  const currentHand = playerCards[currentFocus];
  const currentHandBet = handBets[currentFocus] ?? 0;
  const insuranceCost = getInsuranceCost(currentBet);
  const canDeal = currentBet > 0;

  const canAffordInsurance = insuranceCost > 0 && currentBalance >= insuranceCost;
  const showDouble =
    gameState === GameState.Play &&
    (playState === PlayState.Normal || playState === PlayState.CanSplit) &&
    currentHand !== undefined &&
    playerCards.length === 1 &&
    currentHand.length === 2 &&
    currentHandBet > 0;
  const canDouble = showDouble && currentBalance >= currentHandBet;
  const canSplit =
    gameState === GameState.Play &&
    playState === PlayState.CanSplit &&
    currentHand !== undefined &&
    currentHand.length === 2 &&
    currentHandBet > 0 &&
    currentBalance >= currentHandBet;
  const showResults = gameState === GameState.Results || gameState === GameState.WrapUp;

  const [collectedBustHands, setCollectedBustHands] = useState<Set<number>>(new Set());
  const prevPlayerCountRef = React.useRef(playerCards.length);

  const { displayedBalance, balanceTrend, handleDeal, snapBaselineToPredeal } = useBalanceCounter(
    currentBalance,
    beginDeal,
  );

  useEffect(() => {
    if (gameState === GameState.Play && playState === PlayState.Bust) {
      const timer = setTimeout(() => {
        setCollectedBustHands((prev) => new Set(prev).add(currentFocus));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, playState, currentFocus]);

  // Keep collectedBustHands in sync when split() shifts hand indices.
  // A split at index N inserts one hand, so any tracked index > N must increment by 1.
  useEffect(() => {
    const prevCount = prevPlayerCountRef.current;
    prevPlayerCountRef.current = playerCards.length;

    if (playerCards.length === 0) {
      setCollectedBustHands(new Set());
      return;
    }

    if (playerCards.length > prevCount && gameState === GameState.Animation) {
      // currentFocus is the new right hand (= splitIdx + 1), so splitIdx = currentFocus - 1
      const splitIdx = currentFocus - 1;
      setCollectedBustHands((prev) => {
        if (prev.size === 0) return prev;
        const next = new Set<number>();
        prev.forEach((idx) => next.add(idx > splitIdx ? idx + 1 : idx));
        return next;
      });
    }
  }, [playerCards.length, gameState, currentFocus]);

  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

  useEffect(() => {
    if (debugPaused) return;
    if (gameState === GameState.Dealing) {
      if (deck.deck.length < 52) {
        initializeDeck();
      }

      setGameState(GameState.Animation);
      setTimeout(() => addPlayerCard(0), 250);
      setTimeout(() => addPlayerCard(0), 500);
      setTimeout(() => addDealerCard(false), 1000);
      setTimeout(() => addDealerCard(true), 1500);
      setTimeout(() => setGameState(GameState.DealerCheck), 1500);
    } else if (gameState === GameState.DealerCheck) {
      if (dealerCards[0]?.rank === CardRank.Ace) {
        setGameState(GameState.Insurance);
      } else if (dealerCards.length === 2 && getResolvedHandValue(dealerCards) === 21) {
        setGameState(GameState.DealerPlay);
      } else {
        setGameState(GameState.Play);
      }
    } else if (gameState === GameState.DealerPlay) {
      setGameState(GameState.Animation);
      setDealerCards(
        dealerCards.map((card, index) => (index === 1 ? { ...card, isFlipped: false } : card)),
      );
      setGameState(GameState.DealerDeal);
    } else if (gameState === GameState.Results) {
      setPlayerCards(
        playerCards.map((hand) => hand.map((card) => ({ ...card, isFlipped: false }))),
      );
      setTimeout(() => setGameState(GameState.WrapUp), 3000);
    } else if (gameState === GameState.WrapUp) {
      snapBaselineToPredeal();
      finalizeRound();
    }
  }, [gameState, snapBaselineToPredeal, debugPaused]);

  useEffect(() => {
    if (debugPaused) return;
    if (gameState !== GameState.DealerDeal) {
      return;
    }

    if (getResolvedHandValue(dealerCards) < 17) {
      setTimeout(() => {
        addDealerCard(false);
      }, 1000);
      return;
    }

    setTimeout(() => {
      setGameState(GameState.Results);
    }, 1000);
  }, [addDealerCard, dealerCards, debugPaused, gameState, setGameState]);

  useEffect(() => {
    if (debugPaused) return;
    if (gameState !== GameState.Play) {
      return;
    }

    if (!currentHand) {
      setPlayState(PlayState.None);
      return;
    }

    if (getResolvedHandValue(currentHand) > 21) {
      const lastCard = currentHand[currentHand.length - 1];
      if (lastCard?.isFlipped) {
        return;
      }
      setPlayState(PlayState.Bust);
      setTimeout(() => {
        moveFocus();
      }, 1600);
      return;
    }

    if (currentHand.length > 2) {
      setPlayState(PlayState.Post);
      return;
    }

    if (currentHand.length < 2) {
      setPlayState(PlayState.None);
      return;
    }

    if (
      getRankGameValue(currentHand[0].rank) === getRankGameValue(currentHand[1].rank) &&
      playerCards.length < 4
    ) {
      setPlayState(PlayState.CanSplit);
      return;
    }

    if (playerCards.length > 1) {
      setPlayState(PlayState.Split);
      return;
    }

    if (getResolvedHandValue(currentHand) === 21) {
      setPlayState(PlayState.Blackjack);
      setTimeout(() => {
        setGameState(GameState.Results);
      }, 1250);
      return;
    }

    setPlayState(PlayState.Normal);
  }, [
    currentHand,
    debugPaused,
    gameState,
    moveFocus,
    playerCards.length,
    setGameState,
    setPlayState,
  ]);

  // Regular function declaration (hoisted) so the linter can never create a
  // temporal-dead-zone error by reordering it above its const dependencies.
  // By the time JSX calls this, every const in the component has been evaluated.
  function renderRoundResult() {
    if (!showResults || playerCards.length === 0) return null;

    let totalNet = 0;
    let totalGross = 0;
    let allBlackjack = true;
    let allPush = true;

    for (let i = 0; i < playerCards.length; i++) {
      const outcome = getHandOutcome(playerCards[i], dealerCards, playerCards.length);
      const bet = handBets[i] ?? 0;
      const net = getNetAmount(outcome, bet);
      totalNet += net;
      totalGross += Math.max(0, bet + net);
      if (outcome !== 'blackjack') allBlackjack = false;
      if (outcome !== 'push') allPush = false;
    }

    const label = allBlackjack
      ? 'Blackjack'
      : allPush
        ? 'Push'
        : totalNet > 0
          ? 'Win'
          : totalNet < 0
            ? 'Lose'
            : 'Push';

    const labelColor = allBlackjack
      ? 'text-yellow-400'
      : totalNet > 0
        ? 'text-emerald-400'
        : totalNet < 0
          ? 'text-red-400'
          : 'text-white/50';

    const netColor =
      totalNet > 0 ? 'text-emerald-300' : totalNet < 0 ? 'text-red-300' : 'text-white/40';

    const netStr = allPush
      ? null
      : totalNet > 0
        ? `+$${formatDisplayAmount(totalNet)}`
        : `-$${formatDisplayAmount(Math.abs(totalNet))}`;

    return (
      <motion.div
        key={`result-${gameState}`}
        initial={{ opacity: 0, y: 8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-none"
      >
        <p className={`text-[0.38em] font-bold tracking-[0.25em] uppercase ${labelColor}`}>
          {label}
        </p>

        {netStr && (
          <p className={`text-[0.95em] font-bold leading-none mt-[0.08em] ${netColor}`}>{netStr}</p>
        )}

        {totalGross > 0 && (
          <p className="text-white/25 text-[0.28em] tracking-widest mt-[0.5em] uppercase">
            ${formatDisplayAmount(totalGross)} returned
          </p>
        )}
      </motion.div>
    );
  }

  const renderPlayerCards = () => (
    <div
      className="absolute left-1/2 flex justify-center items-center gap-[4.5%] w-[103%] h-[22%] -translate-x-1/2 -translate-y-1/2"
      style={{ top: '74%' }}
    >
      {playerCards.map((row, rowIndex) => {
        const outcome = showResults ? getHandOutcome(row, dealerCards, playerCards.length) : null;
        const isBustHand = collectedBustHands.has(rowIndex);
        const isCollectingBustHand =
          isBustHand &&
          rowIndex === currentFocus &&
          gameState === GameState.Play &&
          playState === PlayState.Bust;

        return (
          <div className="relative w-[10%] h-full" key={`row-${rowIndex}`}>
            <div
              className={`flex justify-center items-center absolute top-[123%] left-1/2 w-[28%] h-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full font-bold text-[66%] tracking-tight transition-all duration-300 ${
                outcome !== null
                  ? getOutcomeBadgeClasses(outcome)
                  : currentFocus === rowIndex
                    ? 'border-2 border-white/60 bg-black/60 text-white'
                    : 'border border-white/30 bg-black/60 text-white/80'
              }`}
            >
              {getVisibleHandValue(row)}
            </div>

            {outcome !== null && (
              <div
                className="absolute"
                style={{ top: '158%', left: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                  className={`font-bold text-[60%] whitespace-nowrap ${getNetColor(outcome)}`}
                >
                  {getOutcomeLabel(outcome)}
                </motion.div>
              </div>
            )}

            {row.map((card, cardIndex) => {
              // Center the card stack: offset so the group is always centered in the column
              // card width ≈ 65% of column, cards spaced 13% apart
              const baseLeft = 17.5 - (row.length - 1) * 6.5;
              return (
                <Card
                  key={`${rowIndex}-${cardIndex}`}
                  rank={card.rank}
                  suit={card.suit}
                  style={{
                    top: `${cardIndex * -118}%`,
                    left: `${baseLeft + cardIndex * 13}%`,
                    ...card.style,
                  }}
                  isFlipped={card.isFlipped}
                  animation={
                    isCollectingBustHand
                      ? CardAnimation.Collect
                      : isBustHand
                        ? undefined
                        : card.animation
                  }
                  animationTarget={
                    isCollectingBustHand
                      ? getBustCollectionTarget(cardIndex, row.length)
                      : undefined
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const renderDealerCards = () => {
    if (dealerCards.length === 0) {
      return null;
    }

    return (
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[22%]"
        style={{ top: '25%' }}
      >
        {dealerCards.map((card, cardIndex) => (
          <Card
            key={cardIndex}
            rank={card.rank}
            suit={card.suit}
            isFlipped={card.isFlipped}
            animation={card.animation}
            style={{
              top: `${cardIndex * -100}%`,
              left: `${DEALER_STACK_START_LEFT + cardIndex * DEALER_CARD_SPACING}%`,
            }}
          />
        ))}
        <div className="flex justify-center items-center absolute top-[123%] left-1/2 w-[28%] h-[28%] -translate-x-1/2 -translate-y-1/2 border border-white/30 rounded-full bg-black/60 text-white text-[66%] font-bold tracking-tight">
          {getVisibleHandValue(dealerCards)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-[4%] border-b border-white/[0.08] bg-black/20"
        style={{ height: '11%' }}
      >
        <div className="flex flex-col gap-[0.15em]">
          <span className="text-white/40 text-[0.32em] font-bold tracking-[0.2em] uppercase">
            Balance
          </span>
          <span
            className={`text-[0.88em] font-bold leading-none transition-colors duration-300 ${
              balanceTrend === 'up'
                ? 'text-emerald-400'
                : balanceTrend === 'down'
                  ? 'text-red-400'
                  : 'text-white'
            }`}
          >
            <span className="text-red-500">$</span>
            {formatDisplayAmount(displayedBalance)}
          </span>
        </div>
        <motion.span
          className="text-white/20 text-[0.36em] tracking-[0.3em] uppercase font-bold"
          {...introItem(0.1, -8)}
        >
          Blackjack
        </motion.span>
      </div>

      {/* Play area */}
      <div className="relative flex-1">
        {dealerCards.length > 0 && (
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-white/20 text-[0.28em] font-bold tracking-[0.2em] uppercase">
            Dealer
          </div>
        )}

        {renderDealerCards()}

        {/* Center divider */}
        <motion.div
          className="absolute left-[6%] right-[6%] top-1/2 border-t border-white/[0.07] origin-center"
          {...introScale(0.14)}
        />

        {/* Round result badge — shows net profit + gross return for clarity */}
        {renderRoundResult()}

        {renderPlayerCards()}

        {playerCards.length > 0 && playerCards[0].length > 0 && (
          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 text-white/20 text-[0.28em] font-bold tracking-[0.2em] uppercase">
            You
          </div>
        )}

        <InsurancePrompt
          gameState={gameState}
          onBuyInsurance={() => resolveInsuranceDecision(true)}
          onDeclineInsurance={() => resolveInsuranceDecision(false)}
          insuranceCost={insuranceCost}
          canAffordInsurance={canAffordInsurance}
        />
      </div>

      {/* Action bar */}
      <div
        className="flex items-center justify-between gap-4 px-[5%] border-t border-white/[0.08] bg-black/35"
        style={{ height: '22%' }}
      >
        <motion.div className="flex min-w-0 flex-1" {...introItem(0.2, 12)}>
          <BettingControls
            currentBet={gameState === GameState.Betting ? currentBet : totalWagered}
            setBetAmount={updateCurrentBet}
            gameState={gameState}
          />
        </motion.div>
        <motion.div className="flex shrink-0" {...introItem(0.28, 12)}>
          <GameControls
            hit={hit}
            stand={stand}
            split={split}
            double={double}
            deal={handleDeal}
            gameState={gameState}
            playState={playState}
            canDeal={canDeal}
            showDouble={showDouble}
            canDouble={canDouble}
            canSplit={canSplit}
          />
        </motion.div>
      </div>

      {showGameOver && <GameOver onRestart={restartGame} />}
      {import.meta.env.VITE_DEBUG_PANEL === 'true' && <DebugPanel />}
    </div>
  );
};

export default Game;
