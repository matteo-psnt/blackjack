import React, {useState} from 'react';
import '../styles/Game.css';
import Card from './Card';
import {CardAnimation, CardRank, CardSuit, GameState} from './enums';
import Deck from './Deck';
import ChipStack from "./ChipStack";
import BettingControls from "./BettingControls";
import GameControls from "./GameControls";

const Game = () => {
    const [deck] = useState(new Deck());
    const [cards, setCards] = useState<Array<Array<{ rank: CardRank, suit: CardSuit, style?: React.CSSProperties, animation?: CardAnimation }>>>([]);
    const [currentFocus, setCurrentFocus] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(1000);
    const [gameState, setGameState] = useState(GameState.Betting)

    deck.shuffle();

    const updateCurrentBet = (newBet: number) => {
        const betDifference = newBet - currentBet;
        const newBalance = currentBalance - betDifference;

        if (newBet >= 0 && newBalance >= 0) {
            setCurrentBet(newBet);
            setCurrentBalance(newBalance);
        }
    };

    const addCard = () => {
        const newCard = deck.dealCard();
        if (newCard) {
            setCards(currentCards => {
                const newCards = [...currentCards];
                if (!newCards[currentFocus]) {
                    newCards[currentFocus] = [];
                }
                newCards[currentFocus] = [...newCards[currentFocus], {...newCard, animation: CardAnimation.SlideDown}];
                return newCards;
            });
        }
    };

    const addCardIndex = (focusIndex: number) => {
        const newCard = deck.dealCard();
        if (newCard) {
            setCards(currentCards => {
                const newCards = [...currentCards];
                if (!newCards[focusIndex]) {
                    newCards[focusIndex] = [];
                }
                newCards[focusIndex] = [...newCards[focusIndex], {...newCard, animation: CardAnimation.SlideDown}];
                return newCards;
            });
        }
    };

    const split = () => {
        setCards(currentCards => {
            let newCards = [...currentCards];
            newCards = newCards.map((cardGroup, index) => {
                const animation = index < currentFocus ? CardAnimation.SlideLeft : CardAnimation.SlideRight;
                return cardGroup.map(card => ({ ...card, animation }));
            });

            if (newCards[currentFocus] && newCards[currentFocus].length === 2) {
                const [cardLeft, cardRight] = newCards[currentFocus];
                newCards.splice(currentFocus, 1);
                newCards.splice(currentFocus, 0, [{ ...cardLeft, animation: CardAnimation.SlideLeft }],
                    [{ ...cardRight, animation: CardAnimation.SlideDownRight }]
                );
            }
            return newCards;
        });
        setTimeout(() => {
            setCards(currentCards => currentCards.map(cardGroup =>
                cardGroup.map(card => ({ ...card, animation: undefined }))
            ));
        }, 1000);
        setTimeout(() => addCardIndex(currentFocus), 1500);
        setTimeout(() => addCardIndex(currentFocus + 1), 2000);
        setCurrentFocus(currentFocus + 1);
    };

    const calculateValue = (hand: Array<{ rank: CardRank, suit: CardSuit }>) => {
        let value = 0;
        let aces = 0;
        for (let i = 0; i < hand.length; i++) {
            if (hand[i].rank === CardRank.Ace) {
                aces++;
            }
            value += Math.min(10, hand[i].rank);
        }
        while (value <= 11 && aces > 0) {
            value += 10;
            aces--;
        }
        return value;
    }

    const handleChipClick = (chipValue: number) => {
        setCurrentBet(currentBet - chipValue);
        setCurrentBalance(currentBalance + chipValue);
    };

    function displayCards() {
        return <div className="player-cards">
            {cards.map((row, rowIndex) =>
                <div className="card-rows" key={`row-${rowIndex}`}>
                    <div className={`row-value ${currentFocus === rowIndex ? 'current' : ''}`}>
                        {calculateValue(row)}
                    </div>
                    {row.map((card, cardIndex) =>
                        <Card
                            key={`${rowIndex}-${cardIndex}`}
                            rank={card.rank}
                            suit={card.suit}
                            style={{
                                top: `${cardIndex * -118}%`,
                                left: `${cardIndex * 13}%`
                            }}
                            animation={card.animation}
                        />
                    )}
                </div>
            )}
        </div>;
    }

    return (
        <div>
            <div>{currentFocus}</div>
            <GameControls addCard={addCard} split={split} setCurrentFocus={setCurrentFocus} currentFocus={currentFocus} gameState={gameState} setGameState={setGameState}/>
            <div className="dealer-cards">
                <Card rank={CardRank.Ace} suit={CardSuit.Clubs} style={{left: '0px', top: '0px'}}/>
                <Card rank={CardRank.Ace} suit={CardSuit.Clubs} style={{left: '40px', top: '0px'}}/>
            </div>
            {displayCards()}
            <div className="balance">${currentBalance}</div>
            <BettingControls currentBalance={currentBalance} currentBet={currentBet} setBetAmount={updateCurrentBet}/>
            <div className="betting-area">
                <ChipStack chipTotal={currentBet} onChipClick={handleChipClick}/>
            </div>
        </div>
    );
};

export default Game;
