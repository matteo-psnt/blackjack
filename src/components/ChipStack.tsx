import React from 'react';
import '../styles/Chip.css';

interface ChipProps {
    value: number;
    style?: React.CSSProperties;
    onClick: () => void;
}

const Chip: React.FC<ChipProps> = ({ value, style, onClick }) => {
    return (
        <div className="chip-container"
             style={{...style}}
             onClick={onClick}
        >
            <div className="chip">
                <img src={require(`../assets/chips/3D/CHIP-${value.toString()}.png`)} alt={`$${value}`}/>
            </div>
        </div>
    );
};

interface ChipStackProps {
    chipTotal: number;
    onChipClick: (value: number) => void;
}

const ChipStack: React.FC<ChipStackProps> = ({ chipTotal, onChipClick }) => {
    const dollarValues: number[] = [1000, 500, 100, 25, 10, 5, 1];
    let chipComponents: JSX.Element[] = [];
    let remainingAmount = chipTotal;

    for (let value of dollarValues) {
        while (remainingAmount >= value) {
            remainingAmount -= value;
            const offset = chipComponents.length * -30.25;
            chipComponents.push(
                <Chip
                    key={`${value}-${chipComponents.length}`}
                    value={value}
                    style={{ top: `${80 + offset}%` }}
                    onClick={() => onChipClick(value)}
                />
            );
        }
    }

    return (
        <div className="chip-stack">
            {chipComponents}
        </div>
    );
};

export default ChipStack;
