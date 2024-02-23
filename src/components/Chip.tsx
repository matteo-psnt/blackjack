import React from 'react';
import '../styles/Chip.css';

interface ChipProps {
    value: number;
    style?: React.CSSProperties;
}

const Chip: React.FC<ChipProps> = ({ value, style }) => {
    return (
        <div className="chip-container"
             style={{...style}}
        >
            <div className="chip">
                <img src={require(`../assets/chips/3D/CHIP-${value.toString()}.png`)} alt={`$${value}`}/>
            </div>
        </div>
    );
};

export default Chip;
