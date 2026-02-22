import React, { useEffect } from 'react';
import '../styles/Game.css';
import Card from './Card';
import { CardRank, GameState, PlayState } from './enums';
import ChipStack from './ChipStack';
import BettingControls from './BettingControls';
import GameControls from './GameControls';
import InsurancePrompt from './InsurancePrompt';
import GameOver from './GameOver';
import {
  getInsuranceCost,
  getResolvedHandValue,
  getVisibleHandValue,
  useGameStore,
} from '../store/gameStore';

const Game = () => {
  const {
    playerCards,
    dealerCards,
    handBets,
    totalWagered,
    currentFocus,
    currentBet,
    currentBalance,
    gameState,
    playState,
    showGameOver,
    showDebug,
    deck,
    setPlayerCards,
    setDealerCards,
    setCurrentFocus,
    setGameState,
    setPlayState,
    setShowDebug,
    addPlayerCard,
    addDealerCard,
    updateCurrentBet,
    handleChipClick,
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

  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'D' && event.shiftKey) {
        setShowDebug(!showDebug);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setShowDebug, showDebug]);

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

    if (currentHand[0].rank === currentHand[1].rank && playerCards.length < 4) {
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
    <div className="player-cards">
      {playerCards.map((row, rowIndex) => (
        <div className="card-rows" key={`row-${rowIndex}`}>
          <div className={`value ${currentFocus === rowIndex ? 'current' : ''}`}>
            {getVisibleHandValue(row)}
          </div>

          {row.map((card, cardIndex) => (
            <Card
              key={`${rowIndex}-${cardIndex}`}
              rank={card.rank}
              suit={card.suit}
              style={{
                top: `${cardIndex * -118}%`,
                left: `${cardIndex * 13}%`,
                ...card.style,
              }}
              isFlipped={card.isFlipped}
              animation={card.animation}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderDealerCards = () => {
    if (dealerCards.length === 0) {
      return null;
    }

    return (
      <div className="dealer-cards">
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
        <div className="value">{getVisibleHandValue(dealerCards)}</div>
      </div>
    );
  };

  return (
    <div>
      {showDebug && process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#0f0',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          <div>DEBUG MODE (Shift+D to toggle)</div>
          <div>Focus: {currentFocus}</div>
          <div>State: {GameState[gameState]}</div>
          <div>Play: {PlayState[playState]}</div>
          <div>Hands: {playerCards.length}</div>
          <div>Bets: {JSON.stringify(handBets)}</div>
          <div>Wagered: ${totalWagered}</div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button onClick={double} style={{ fontSize: '10px', padding: '2px 5px' }}>
              Double
            </button>
            <button onClick={split} style={{ fontSize: '10px', padding: '2px 5px' }}>
              Split
            </button>
            <button
              onClick={() => setCurrentFocus(Math.max(0, currentFocus - 1))}
              style={{ fontSize: '10px', padding: '2px 5px' }}
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentFocus(Math.min(playerCards.length - 1, currentFocus + 1))}
              style={{ fontSize: '10px', padding: '2px 5px' }}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      <div className="balance">${currentBalance}</div>

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
      {renderDealerCards()}
      {renderPlayerCards()}
      <InsurancePrompt
        gameState={gameState}
        onBuyInsurance={() => resolveInsuranceDecision(true)}
        onDeclineInsurance={() => resolveInsuranceDecision(false)}
        insuranceCost={insuranceCost}
        canAffordInsurance={canAffordInsurance}
      />

      <BettingControls
        currentBet={currentBet}
        setBetAmount={updateCurrentBet}
        gameState={gameState}
      />
      <div className="betting-area">
        <ChipStack
          chipTotal={gameState === GameState.Betting ? currentBet : totalWagered}
          onChipClick={handleChipClick}
        />
      </div>

      {showGameOver && <GameOver onRestart={restartGame} />}
    </div>
  );
};

export default Game;
