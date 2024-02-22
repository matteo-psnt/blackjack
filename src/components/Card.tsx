import React, {useState} from 'react';
import './Card.css';
import './Game.css';
import blank from '../assets/cards/blank.svg';
import back from '../assets/cards/back.svg';
import {CardRank, CardSuit} from './enums';

interface CardProps {
    rank: CardRank;
    suit: CardSuit;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({rank, suit, style}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const onDoubleClick = () => setIsFlipped(!isFlipped);

    const getImage = () => {
        if (isFlipped) return blank;
        try {
            return require(`../assets/cards/${suit}-${rank.toString()}.svg`);
        } catch (e) {
            console.warn(`Could not load image: ${suit}-${rank.toString()}.svg`);
            return blank;
        }
    };

    // JSX Rendering
    return (
        <div
            className="card-container"
            onDoubleClick={onDoubleClick}
            style={{
                transition: `all ${style?.transitionDuration || '0s'} ease-in-out`,
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
