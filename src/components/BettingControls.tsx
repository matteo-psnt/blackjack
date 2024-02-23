import React, {useState} from 'react';
import '../styles/BettingControls.css';

interface BettingControlsProps {
    onBetChange: (value: number) => void;
    currentBalance: number;
}

const chipValues = [1, 5, 10, 25, 100, 500, 1000];

const BettingControls: React.FC<BettingControlsProps> = ({ onBetChange, currentBalance }) => {
    const [animateChip, setAnimateChip] = useState<number | null>(null);

    const handleClick = (value: number) => {
        setAnimateChip(value);
        onBetChange(value);

        setTimeout(() => setAnimateChip(null), 200);
    };

    return (
        <div className={'chip-button-container'}>
            {chipValues.filter(value => value <= currentBalance).map((value) => ( // Filter based on current balance
                <img
                    key={value}
                    src={require(`../assets/chips/2D/CHIP-${value}.png`)}
                    alt={`Chip $${value}`}
                    className="chip-button"
                    onClick={() => handleClick(value)}
                />
            ))}
            {animateChip && (
                <img
                    className="chip-animate"
                    src={require(`../assets/chips/3D/CHIP-${animateChip}.png`)}
                    alt={`Chip ${animateChip}`}
                    style={{ right: '20%' }} // Adjust based on where you want the chip to end up
                />
            )}
        </div>
    );
};

export default BettingControls;