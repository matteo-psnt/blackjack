import React, { useState } from 'react';
import Card from './Card';

const suits = ['club', 'diamond', 'heart', 'spade'];
const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const Deck = () => {
    const [cards, setCards] = useState(suits.flatMap((suit, suitIndex) => 
        ranks.map((rank, rankIndex) => ({
            suit,
            rank,
            id: `${suit}-${rank}`,
            position: {
                x: 20 + rankIndex * 0.5, // Horizontal offset
                y: 20 + suitIndex * 20 // Vertical offset
            }
        }))
    ));

    const moveCard = (id, newX, newY) => {
        setCards(cards.map(card => 
            card.id === id ? { ...card, position: { x: newX, y: newY } } : card
        ));
    };

    return (
        <div className="deck">
            {cards.map(card => (
                <Card
                    key={card.id}
                    rank={card.rank}
                    suit={card.suit}
                    position={card.position}
                    moveCard={moveCard}
                />
            ))}
        </div>
    );
};

export default Deck;
