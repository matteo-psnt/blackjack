import React from 'react';

const chipImages = import.meta.glob('../assets/chips/3D/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

interface ChipProps {
  value: number;
  style?: React.CSSProperties;
  onClick: () => void;
}

const Chip: React.FC<ChipProps> = ({ value, style, onClick }) => {
  const chipImage = chipImages[`../assets/chips/3D/CHIP-${value.toString()}.png`];

  return (
    <div
      className="relative h-[25%] w-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110"
      style={{ ...style }}
      onClick={onClick}
    >
      <div className="relative h-full w-full">
        <img src={chipImage} alt={`$${value}`} className="absolute h-full w-full object-contain" />
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
          style={{ top: `${70 + offset}%` }}
          onClick={() => onChipClick(value)}
        />,
      );
    }
  }

  return <div className="absolute h-full w-full">{chipComponents}</div>;
};

export default ChipStack;
