import React, {useEffect, useRef } from 'react';
import '../styles/BettingControls.css';

interface BettingControlsProps {
    currentBalance: number;
    currentBet: number;
    onBetChange: (value: number) => void;
    setCurrentBet: (value: number) => void;
}

const chipValues = [1, 5, 10, 25, 100, 500, 1000];

const BettingControls: React.FC<BettingControlsProps> = ({ currentBalance, currentBet, onBetChange, setCurrentBet }) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!["1", "2", "3", "4", "5", "6", "7", "8", "9", "Enter", "Backspace", "ArrowLeft", "ArrowRight", "Delete"].includes(event.key)) {
            event.preventDefault();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
        }
    };
    const handleBetChange = (event: React.FocusEvent<HTMLDivElement>) => {
        let betText = event.currentTarget.innerText;
        betText = betText.replace(/\$$/, '');
        const newBet = parseInt(betText, 10);

        if (!isNaN(newBet)) {
            setCurrentBet(newBet);
            event.currentTarget.innerText = `${currentBet}$`;
        } else {
            event.currentTarget.innerText = `${currentBet}$`;
        }
    };

    return (
        <div>
            <div className={'chip-button-container'}>
                {chipValues.filter(value => value <= currentBalance).map((value) => ( // Filter based on current balance
                    <img
                        key={value}
                        src={require(`../assets/chips/2D/CHIP-${value}.png`)}
                        alt={`Chip $${value}`}
                        className="chip-button"
                        onClick={() => onBetChange(value)}/>
                ))}
            </div>
            <div
                className="current-bet"
                contentEditable={true}
                onKeyDown={handleKeyDown}
                onBlur={handleBetChange}
                suppressContentEditableWarning={true}
            >
                {`${currentBet}$`}
            </div>
        </div>
    );
};

export default BettingControls;