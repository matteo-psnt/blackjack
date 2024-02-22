import React, {useState} from 'react';
import './Game.css';
import Card from './Card';
import {CardRank, CardSuit} from './enums';
import Deck from './Deck';

// enum GameState {
//     bet,
//     init,
//     userTurn,
//     dealerTurn
// }

const Game = () => {
    const [deck] = useState(new Deck());
    const [cards, setCards] = useState<Array<Array<{ rank: CardRank, suit: CardSuit, style?: React.CSSProperties }>>>([]);
    const [currentFocus, setCurrentFocus] = useState(0);


    deck.shuffle();
    console.log(deck.deck);

    const addCard = () => {
        const newCard = deck.dealCard();
        if (newCard) {
            setCards(currentCards => {
                const newCards = [...currentCards];
                if (!newCards[currentFocus]) {
                    newCards[currentFocus] = [];
                }
                newCards[currentFocus] = [...newCards[currentFocus], newCard];
                return newCards;
            });
        }
    };

    const split = () => {
        setCards(currentCards => {
            if (currentCards[currentFocus] && currentCards[currentFocus].length === 2) {
                const card = currentCards[currentFocus].pop();
                if (card) {
                    currentCards.splice(currentFocus + 1, 0, [card]);
                    setCurrentFocus(currentFocus + 1);
                }
            }
            return currentCards;
        });
    }

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

    return (
        <div>
            <button onClick={addCard}>Add Card</button>
            <button onClick={split}>Split</button>
            <button onClick={() => setCurrentFocus(currentFocus + 1)}>Next</button>
            <button onClick={() => setCurrentFocus(currentFocus - 1)}>Previous</button>
            <text>{currentFocus}</text>
            <div className="dealer-cards">
                <Card rank={CardRank.Ace} suit={CardSuit.Clubs} style={{left: '0px', top: '0px'}}/>
                <Card rank={CardRank.Ace} suit={CardSuit.Clubs} style={{left: '40px', top: '0px'}}/>
            </div>
            <div className="player-cards">
                {cards.map((row, rowIndex) =>
                    <div className="card-rows" key={`row-${rowIndex}`}>
                        <text className={`row-value ${currentFocus === rowIndex ? 'current' : ''}`}>{calculateValue(row)}</text>
                        {row.map((card, cardIndex) =>
                            <Card
                                key={`${rowIndex}-${cardIndex}`}
                                rank={card.rank}
                                suit={card.suit}
                                style={{
                                    transitionDuration: '0.5s',
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
            <div className="betting-area"></div>
            <div className="player-controls">
                <button>Hit</button>
                <button>Stand</button>
                <button>Double Down</button>
                <button>Split</button>
            </div>

        </div>
    );
};

export default Game;
