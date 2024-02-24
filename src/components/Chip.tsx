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

export default Chip;
