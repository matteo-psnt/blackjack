import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import { CardRank, GameState, PlayState } from './enums';
import BettingControls from './BettingControls';
import GameControls from './GameControls';
import InsurancePrompt from './InsurancePrompt';
import GameOver from './GameOver';
import {
  Card as CardData,
  getInsuranceCost,
  getResolvedHandValue,
  getVisibleHandValue,
  useGameStore,
} from '../store/gameStore';

type HandOutcome = 'bust' | 'lose' | 'push' | 'win' | 'blackjack';
const getRankGameValue = (rank: CardRank) => Math.min(10, rank);

const Game = () => {
  const {
    playerCards,
    dealerCards,
    handBets,
    currentFocus,
    currentBet,
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

  const currentHand = playerCards[currentFocus];
  const currentHandBet = handBets[currentFocus] ?? 0;
  const insuranceCost = getInsuranceCost(currentBet);
  const canDeal = currentBet > 0;
  const canAffordInsurance = insuranceCost > 0 && currentBalance >= insuranceCost;
  const canDouble =
    gameState === GameState.Play &&
    (playState === PlayState.Normal || playState === PlayState.CanSplit) &&
    currentHand !== undefined &&
    playerCards.length === 1 &&
    currentHand.length === 2 &&
    currentHandBet > 0 &&
    currentBalance >= currentHandBet;
  const canSplit =
    gameState === GameState.Play &&
    playState === PlayState.CanSplit &&
    currentHand !== undefined &&
    currentHand.length === 2 &&
    currentHandBet > 0 &&
    currentBalance >= currentHandBet;
  const formatDisplayAmount = (amount: number) =>
    Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  const showResults = gameState === GameState.Results || gameState === GameState.WrapUp;

  // Animated balance counter
  const [displayedBalance, setDisplayedBalance] = useState(currentBalance);
  const [balanceTrend, setBalanceTrend] = useState<'up' | 'down' | null>(null);
  const balanceFromRef = useRef(currentBalance);
  const balanceRafRef = useRef<number>(0);
  const balanceTrendTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const from = balanceFromRef.current;
    const to = currentBalance;
    if (from === to) return;

    setBalanceTrend(to > from ? 'up' : 'down');
    if (balanceTrendTimer.current) clearTimeout(balanceTrendTimer.current);
    cancelAnimationFrame(balanceRafRef.current);

    const duration = 600;
    const startTime = performance.now();

    const animate = (time: number) => {
      const t = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (to - from) * eased;
      balanceFromRef.current = value;
      setDisplayedBalance(Math.round(value));
      if (t < 1) {
        balanceRafRef.current = requestAnimationFrame(animate);
      } else {
        balanceFromRef.current = to;
        setDisplayedBalance(to);
        balanceTrendTimer.current = setTimeout(() => setBalanceTrend(null), 500);
      }
    };

    balanceRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(balanceRafRef.current);
  }, [currentBalance]);

  const getHandOutcome = (playerHand: CardData[]): HandOutcome => {
    const playerValue = getResolvedHandValue(playerHand);
    const dealerValue = getResolvedHandValue(dealerCards);
    const dealerHasBlackjack = dealerCards.length === 2 && dealerValue === 21;
    const isNaturalBlackjack =
      playerValue === 21 && playerHand.length === 2 && playerCards.length === 1;

    if (playerValue > 21) return 'bust';
    if (isNaturalBlackjack) return dealerHasBlackjack ? 'push' : 'blackjack';
    if (dealerHasBlackjack) return 'lose';
    if (dealerValue > 21 || playerValue > dealerValue) return 'win';
    if (playerValue === dealerValue) return 'push';
    return 'lose';
  };

  const getNetAmount = (outcome: HandOutcome, bet: number): number => {
    switch (outcome) {
      case 'blackjack': return bet * 1.5;
      case 'win': return bet;
      case 'push': return 0;
      default: return -bet;
    }
  };

  const formatNet = (outcome: HandOutcome, amount: number): string => {
    if (outcome === 'push') return 'Push';
    const abs = formatDisplayAmount(Math.abs(amount));
    return amount > 0 ? `+$${abs}` : `-$${abs}`;
  };

  const getOutcomeBadgeClasses = (outcome: HandOutcome): string => {
    switch (outcome) {
      case 'win': return 'border-2 border-emerald-500 bg-emerald-600 text-white';
      case 'blackjack': return 'border-2 border-yellow-400 bg-yellow-500 text-black';
      case 'push': return 'border border-white/30 bg-black/60 text-white/60';
      default: return 'border-2 border-red-600 bg-red-700 text-white';
    }
  };

  const getNetColor = (outcome: HandOutcome): string => {
    switch (outcome) {
      case 'win':
      case 'blackjack': return 'text-emerald-400';
      case 'push': return 'text-white/50';
      default: return 'text-red-400';
    }
  };

  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

useEffect(() => {
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
      finalizeRound();
    }
  }, [gameState]);

  useEffect(() => {
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
  }, [addDealerCard, dealerCards, gameState, setGameState]);

  useEffect(() => {
    if (gameState !== GameState.Play) {
      return;
    }

    if (!currentHand) {
      setPlayState(PlayState.None);
      return;
    }

    if (getResolvedHandValue(currentHand) > 21) {
      setPlayState(PlayState.Bust);
      setTimeout(() => {
        moveFocus();
      }, 1000);
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
  }, [currentHand, gameState, moveFocus, playerCards.length, setGameState, setPlayState]);

  const renderPlayerCards = () => (
    <div
      className="absolute left-1/2 flex justify-center items-center gap-[4.5%] w-[103%] h-[22%] -translate-x-1/2 -translate-y-1/2"
      style={{ top: '74%' }}
    >
      {playerCards.map((row, rowIndex) => {
        const outcome = showResults ? getHandOutcome(row) : null;
        const bet = handBets[rowIndex] ?? 0;
        const net = outcome !== null ? getNetAmount(outcome, bet) : 0;

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
              <div className="absolute" style={{ top: '158%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                  className={`font-bold text-[60%] whitespace-nowrap ${getNetColor(outcome)}`}
                >
                  {formatNet(outcome, net)}
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
                  animation={card.animation}
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
              left: `${cardIndex * 30}%`,
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
          <span className={`text-[0.9em] font-bold leading-none transition-colors duration-300 ${
            balanceTrend === 'up' ? 'text-emerald-400' :
            balanceTrend === 'down' ? 'text-red-400' : 'text-white'
          }`}>
            <span className="text-red-500">$</span>
            {formatDisplayAmount(displayedBalance)}
          </span>
        </div>
        <span className="text-white/20 text-[0.36em] tracking-[0.3em] uppercase font-bold">
          Blackjack
        </span>
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
        <div className="absolute left-[6%] right-[6%] top-1/2 border-t border-white/[0.07]" />

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
        <BettingControls
          currentBet={currentBet}
          setBetAmount={updateCurrentBet}
          gameState={gameState}
        />
        <GameControls
          hit={hit}
          stand={stand}
          split={split}
          double={double}
          deal={beginDeal}
          gameState={gameState}
          playState={playState}
          canDeal={canDeal}
          canDouble={canDouble}
          canSplit={canSplit}
        />
      </div>

      {showGameOver && <GameOver onRestart={restartGame} />}
    </div>
  );
};

export default Game;
