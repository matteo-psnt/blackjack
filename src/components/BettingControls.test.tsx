import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BettingControls from './BettingControls';
import { GameState } from './enums';

describe('BettingControls', () => {
  it('does not send a negative bet when ArrowDown is pressed at zero', () => {
    const setBetAmount = vi.fn();

    render(
      <BettingControls currentBet={0} setBetAmount={setBetAmount} gameState={GameState.Betting} />,
    );

    const betControl = screen.getByText('0$');
    fireEvent.focus(betControl);
    fireEvent.keyDown(betControl, { key: 'ArrowDown' });

    expect(setBetAmount).toHaveBeenCalledWith(0);
  });

  it('re-renders the accepted staged bet after the store rejects a manual edit', () => {
    const setBetAmount = vi.fn();

    const { rerender } = render(
      <BettingControls currentBet={10} setBetAmount={setBetAmount} gameState={GameState.Betting} />,
    );

    const betControl = screen.getByText('10$');
    fireEvent.focus(betControl);

    betControl.textContent = '9999';
    fireEvent.input(betControl);
    fireEvent.blur(betControl);

    expect(setBetAmount).toHaveBeenCalledWith(9999);

    rerender(
      <BettingControls currentBet={10} setBetAmount={setBetAmount} gameState={GameState.Betting} />,
    );

    expect(screen.getByText('10$')).toBeInTheDocument();
  });
});
