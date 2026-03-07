import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BettingControls from './BettingControls';
import { GameState } from '../game/model';

describe('BettingControls', () => {
  it('does not send a negative bet when ArrowDown is pressed at zero', () => {
    const setBetAmount = vi.fn();

    render(
      <BettingControls currentBet={0} setBetAmount={setBetAmount} gameState={GameState.Betting} />,
    );

    const betControl = screen.getByDisplayValue('$0');
    fireEvent.focus(betControl);
    fireEvent.keyDown(betControl, { key: 'ArrowDown' });

    expect(setBetAmount).toHaveBeenCalledWith(0);
  });

  it('re-renders the accepted staged bet after the store rejects a manual edit', () => {
    const setBetAmount = vi.fn();

    const { rerender } = render(
      <BettingControls currentBet={10} setBetAmount={setBetAmount} gameState={GameState.Betting} />,
    );

    const betControl = screen.getByDisplayValue('$10');
    fireEvent.focus(betControl);
    fireEvent.change(betControl, { target: { value: '9999' } });
    fireEvent.blur(betControl);

    expect(setBetAmount).toHaveBeenCalledWith(9999);

    rerender(
      <BettingControls currentBet={10} setBetAmount={setBetAmount} gameState={GameState.Betting} />,
    );

    expect(screen.getByDisplayValue('$10')).toBeInTheDocument();
  });
});
