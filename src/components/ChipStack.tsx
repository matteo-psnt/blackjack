import React from 'react';
import Chip from "./Chip";
import '../styles/Chip.css';

interface ChipStackProps {
    chipTotal: number;
}

const ChipStack: React.FC<ChipStackProps> = ({ chipTotal }) => {
    const dollarValues: number[] = [1000, 500, 100, 25, 10, 5, 1];
    let chipComponents: JSX.Element[] = [];
    let remainingAmount = chipTotal;

    for (let value of dollarValues) {
        while (remainingAmount >= value) {
            remainingAmount -= value;
            const offset = chipComponents.length * -107;
            chipComponents.push(
                <Chip
                    key={`${value}-${chipComponents.length}`}
                    value={value}
                    style={{ top: `${80 + offset}%` }}
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
