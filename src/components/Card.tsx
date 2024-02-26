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
    isFlipped?: boolean
    animation?: CardAnimation;
}

const Card: React.FC<CardProps> = ({rank, suit, style, isFlipped, animation}) => {
    const getImage = () => {
        if (isFlipped) return blank;
        return require(`../assets/cards/${suit}-${rank.toString()}.svg`);
    };

    return (
        <div
            className={`card-container ${animation ? animation : ''}`}
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
