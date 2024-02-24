import React, {useEffect, useState} from 'react';
import '../styles/Card.css';
import blank from '../assets/cards/blank.svg';
import back from '../assets/cards/back.svg';
import {CardRank, CardSuit} from './enums';
import {CardAnimation} from './enums';

interface CardProps {
    rank: CardRank;
    suit: CardSuit;
    style?: React.CSSProperties;
    animation?: CardAnimation;
}

const Card: React.FC<CardProps> = ({rank, suit, style, animation}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const onDoubleClick = () => setIsFlipped(!isFlipped);

    const getImage = () => {
        if (isFlipped) return blank;
        return require(`../assets/cards/${suit}-${rank.toString()}.svg`);
    };

    return (
        <div
            className={`card-container ${animation ? animation : ''}`}
            onDoubleClick={onDoubleClick}
            style={{
                ...style
            }}
        >
            <div className={`card ${isFlipped ? 'flipped' : ''}`}>
                <img className="front" src={getImage()} alt={isFlipped ? 'Card Back' : `${rank} of ${suit}`}/>
                <img className="back" src={back} alt="Card Back"/>
            </div>
        </div>
    );
};

export default Card;
