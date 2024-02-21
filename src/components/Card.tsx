import React, { useState, useEffect } from 'react';
import './Card.css';
import blank from '../assets/cards/blank.svg';
import back from '../assets/cards/back.svg';
import { CardRank, CardSuit } from './enums';

interface CardProps {
    rank: CardRank;
    suit: CardSuit;
}

type RelState = { x: number; y: number; } | null;

const Card: React.FC<CardProps> = ({ rank, suit }) => {
    const [isDragging, setIsDragging] = useState(false);
    // Initialize position in percentages instead of pixels
    const [position, setPosition] = useState({
        x: (100 / window.innerWidth) * 100,  // Example starting at 100px, converted to percentage of window width
        y: (300 / window.innerHeight) * 100  // Example starting at 300px, converted to percentage of window height
    });
    const [rel, setRel] = useState<RelState>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Event Handlers
    const onDoubleClick = () => setIsFlipped(!isFlipped);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        const card = (e.target as HTMLDivElement).getBoundingClientRect();
        setRel({
            x: e.clientX - card.left,
            y: e.clientY - card.top,
        });
        setIsDragging(true);
        e.stopPropagation();
        e.preventDefault();
    };

    const onMouseUp = () => setIsDragging(false);

    // Effects
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging || !rel) return;
            // Convert pageX and pageY to percentages of the window size
            setPosition({
                x: ((e.pageX - rel.x) / window.innerWidth) * 100,
                y: ((e.pageY - rel.y) / window.innerHeight) * 100,
            });
        };

        if (isDragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        } else {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, rel]);

    // Helper Functions
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
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                position: 'absolute',
            }}
        >
            <div className={`card ${isFlipped ? 'flipped' : ''}`}>
                <img className="front" src={getImage()} alt={isFlipped ? 'Card Back' : `${rank} of ${suit}`} />
                <img className="back" src={back} alt="Card Back" />
            </div>
        </div>
    );
};

export default Card;
