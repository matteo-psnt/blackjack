import React, {useEffect, useState} from 'react';
import '../styles/BettingControls.css';
import {GameState} from "./enums";

interface BettingControlsProps {
    currentBet: number;
    setBetAmount: (value: number) => void;
    gameState: GameState;
}

const BettingControls: React.FC<BettingControlsProps> = ({ currentBet, setBetAmount, gameState }) => {
    const [displayValue, setDisplayValue] = useState(`${currentBet}$`);
    const [isEditing, setIsEditing] = useState(false);
    const [isBetting, setIsBetting] = useState(true)

    useEffect(() => {
        if (!isEditing) {
            setDisplayValue(`${currentBet}$`);
        }
    }, [currentBet, isEditing]);

    useEffect(() => {
        if (gameState === GameState.Betting) {
            setIsBetting(true);
        } else if (gameState === GameState.Dealing) {
            setIsBetting(false)
        }
    }, [gameState]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Enter", "Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete"].includes(event.key)) {
            event.preventDefault();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setDisplayValue(`${currentBet + 1}$`);
            setBetAmount(currentBet + 1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setDisplayValue(`${currentBet - 1}$`);
            setBetAmount(currentBet - 1);
        }
    };
    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        setIsEditing(false);
        const betText = event.currentTarget.innerText.replace(/\D/g, '');
        const newBet = parseInt(betText, 10);

        if (!isNaN(newBet)) {
            setBetAmount(newBet);
        }
        event.currentTarget.innerText = `${currentBet}$`;
    };

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        setIsEditing(true);
        const editedText = event.currentTarget.innerText.replace(/\D/g, '');
        const inputBet = parseInt(editedText, 10);

        if (!isNaN(inputBet) && inputBet > 0) {
            setBetAmount(inputBet);
        } else {
            setBetAmount(0);
        }
    };

    return (
        <div
            className="current-bet"
            contentEditable={isBetting}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onInput={handleInput}
        >
            {displayValue}
        </div>
    );
};

export default BettingControls;