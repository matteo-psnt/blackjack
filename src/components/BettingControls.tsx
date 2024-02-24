import React, {useEffect, useState} from 'react';
import '../styles/BettingControls.css';

interface BettingControlsProps {
    currentBalance: number;
    currentBet: number;
    changeBetAmount: (value: number) => void;
    setBetAmount: (value: number) => void;
}

const chipValues = [1, 5, 10, 25, 100, 500, 1000];

const ChipButton: React.FC<{ value: number; onClick: () => void }> = ({ value, onClick }) => (
    <img
        src={require(`../assets/chips/2D/CHIP-${value}.png`)}
        alt={`Chip $${value}`}
        className="chip-button"
        onClick={onClick}
    />
);

const BettingControls: React.FC<BettingControlsProps> = ({ currentBalance, currentBet, changeBetAmount, setBetAmount }) => {
    const [displayValue, setDisplayValue] = useState(`${currentBet}$`);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setDisplayValue(`${currentBet}$`);
        }
    }, [currentBet, isEditing]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Enter", "Backspace", "ArrowLeft", "ArrowRight", "Delete"].includes(event.key)) {
            event.preventDefault();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
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
        <div>
            <div className={'chip-button-container'}>
                {chipValues.filter(value => value <= currentBalance).map((value) => (
                    <ChipButton key={value} value={value} onClick={() => changeBetAmount(value)}/>
                ))}
            </div>
            <div
                className="current-bet"
                contentEditable={true}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onInput={handleInput}
            >
                {displayValue}
            </div>
        </div>
    );
};

export default BettingControls;