import React, { useEffect } from 'react';
import '../styles/Game.css';
import Card from './Card';
import { CardRank, GameState, PlayState } from './enums';
import ChipStack from './ChipStack';
import BettingControls from './BettingControls';
import GameControls from './GameControls';
import InsurancePrompt from './InsurancePrompt';
import GameOver from './GameOver';
import { useGameStore } from '../store/gameStore';

const Game = () => {
  // Get state from Zustand
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
  } = useGameStore();

  // Get actions from Zustand
  const {
    setPlayerCards,
    setDealerCards,
    setHandBets,
    setTotalWagered,
    setCurrentFocus,
    setCurrentBalance,
    setGameState,
    setPlayState,
    setShowGameOver,
    setShowDebug,
    addPlayerCard,
    addDealerCard,
    updateCurrentBet,
    handleChipClick,
    restartGame,
    initializeDeck,
    hit,
    stand,
    split,
    double,
    moveFocus,
  } = useGameStore();

  // Calculate hand value
  const calculateValue = (
    hand: Array<{ rank: CardRank; isFlipped?: boolean }>,
    includeUnflipped?: boolean,
  ) => {
    let value = 0;
    let aces = 0;
    for (let i = 0; i < hand.length; i++) {
      if (!hand[i].isFlipped || includeUnflipped) {
        if (hand[i].rank === CardRank.Ace) {
          aces++;
        }
        value += Math.min(10, hand[i].rank);
      }
    }
    while (value <= 11 && aces > 0) {
      value += 10;
      aces--;
    }
    return value;
  };

  // Initialize deck on mount
  useEffect(() => {
    initializeDeck();
  }, []);

  // Debug toggle
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'D' && e.shiftKey) {
        setShowDebug(!showDebug);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showDebug, setShowDebug]);

  // Game state transitions
  useEffect(() => {
    if (gameState === GameState.Dealing) {
      // Initialize hand bets with current bet
      setHandBets([currentBet]);
      setTotalWagered(currentBet);

      // Check if deck needs reshuffling
      if (deck.deck.length < 52) {
        deck.initializeDeck(6);
        deck.shuffle();
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
      } else if (calculateValue(dealerCards, true) === 21) {
        setGameState(GameState.DealerPlay);
      } else {
        setGameState(GameState.Play);
      }
    } else if (gameState === GameState.DealerPlay) {
      setGameState(GameState.Animation);
      setDealerCards([dealerCards[0], { ...dealerCards[1], isFlipped: false }]);
      setGameState(GameState.DealerDeal);
    } else if (gameState === GameState.Results) {
      setPlayerCards(
        playerCards.map((hand) => hand.map((card) => ({ ...card, isFlipped: false }))),
      );

      // Calculate total payouts using handBets
      let totalPayout = 0;
      playerCards.forEach((hand, index) => {
        const playerValue = calculateValue(hand);
        const dealerValue = calculateValue(dealerCards);
        const handBet = handBets[index];

        if (playerValue > 21 || (playerValue < dealerValue && dealerValue <= 21)) {
          // Loss - no payout
          totalPayout += 0;
        } else if (playerValue === dealerValue) {
          // Push - return bet
          totalPayout += handBet;
        } else if (playerValue === 21 && hand.length === 2 && playerCards.length === 1) {
          // Blackjack - pay 3:2
          totalPayout += Math.ceil(2.5 * handBet);
        } else {
          // Win - pay 1:1
          totalPayout += 2 * handBet;
        }
      });

      // Update balance with total payout
      setCurrentBalance(currentBalance + totalPayout);
      setTimeout(() => setGameState(GameState.WrapUp), 3000);
    } else if (gameState === GameState.WrapUp) {
      setPlayerCards([]);
      setDealerCards([]);
      setHandBets([]);
      setTotalWagered(0);
      setCurrentFocus(0);

      // Check if player is out of money
      if (currentBalance <= 0) {
        setShowGameOver(true);
      } else {
        setGameState(GameState.Betting);
      }
    }
  }, [gameState]);

  // Dealer dealing logic
  useEffect(() => {
    if (gameState === GameState.DealerDeal) {
      if (calculateValue(dealerCards) < 17) {
        setTimeout(() => {
          addDealerCard(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setGameState(GameState.Results);
        }, 1000);
      }
    }
  }, [dealerCards, gameState]);

  // Play state logic
  useEffect(() => {
    if (gameState === GameState.Play) {
      if (!playerCards[currentFocus]) {
        setPlayState(PlayState.None);
      } else if (calculateValue(playerCards[currentFocus]) > 21) {
        setPlayState(PlayState.Bust);
        setTimeout(() => {
          moveFocus();
        }, 1000);
      } else if (playerCards[currentFocus].length > 2) {
        setPlayState(PlayState.Post);
      } else if (playerCards[currentFocus].length < 2) {
        setPlayState(PlayState.None);
      } else if (
        playerCards[currentFocus][0].rank === playerCards[currentFocus][1].rank &&
        playerCards.length < 4
      ) {
        setPlayState(PlayState.CanSplit);
      } else if (playerCards.length > 1) {
        setPlayState(PlayState.Split);
      } else if (calculateValue(playerCards[currentFocus]) === 21) {
        setPlayState(PlayState.Blackjack);
        setTimeout(() => {
          setGameState(GameState.Results);
        }, 1250);
      } else {
        setPlayState(PlayState.Normal);
      }
    }
  }, [gameState, playerCards, currentFocus]);

  function displayPlayerCards() {
    return (
      <div className="player-cards">
        {playerCards.map((row, rowIndex) => (
          <div className="card-rows" key={`row-${rowIndex}`}>
            <div className={`value ${currentFocus === rowIndex ? 'current' : ''}`}>
              {calculateValue(row)}
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
  }

  function displayDealerCards() {
    if (dealerCards.length > 0) {
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
          <div className={`value`}>{calculateValue(dealerCards)}</div>
        </div>
      );
    }
  }

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
          <div>🐛 DEBUG MODE (Shift+D to toggle)</div>
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
              onClick={() =>
                setCurrentFocus(Math.min(playerCards.length - 1, currentFocus + 1))
              }
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
        gameState={gameState}
        setGameState={setGameState}
        currentBet={currentBet}
        playState={playState}
      />
      {displayDealerCards()}
      {displayPlayerCards()}
      <InsurancePrompt
        gameState={gameState}
        setGameState={setGameState}
        setCurrentBalance={setCurrentBalance}
        currentBalance={currentBalance}
        betAmount={currentBet}
        dealerHas21={dealerCards.length > 0 && calculateValue(dealerCards) === 21}
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
