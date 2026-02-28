import { fireEvent, render, screen } from '@testing-library/react';
import GameControls from './GameControls';
import { GameState, PlayState } from './enums';
import { createGameControlsProps } from '../test/factories';

describe('GameControls', () => {
  it('does not start dealing when no bet has been placed', () => {
    const props = createGameControlsProps({
      currentBet: 0,
      gameState: GameState.Betting,
    });

    render(<GameControls {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Deal' }));

    expect(props.setGameState).not.toHaveBeenCalled();
  });

  it('starts dealing when a bet has been placed', () => {
    const props = createGameControlsProps({
      currentBet: 25,
      gameState: GameState.Betting,
    });

    render(<GameControls {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Deal' }));

    expect(props.setGameState).toHaveBeenCalledWith(GameState.Dealing);
  });

  it.each([
    [PlayState.Normal, ['Hit', 'Stand', 'Double'], ['Split']],
    [PlayState.CanSplit, ['Hit', 'Stand', 'Double', 'Split'], []],
    [PlayState.Split, ['Hit', 'Stand'], ['Double', 'Split']],
    [PlayState.Post, ['Hit', 'Stand'], ['Double', 'Split']],
  ])(
    'renders the expected play controls for %s',
    (playState: PlayState, visibleButtons: string[], hiddenButtons: string[]) => {
      const props = createGameControlsProps({
        gameState: GameState.Play,
        playState,
      });

      render(<GameControls {...props} />);

      for (const label of visibleButtons) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      }

      for (const label of hiddenButtons) {
        expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
      }
    },
  );

  it('renders no controls outside betting and play', () => {
    const props = createGameControlsProps({
      gameState: GameState.DealerPlay,
    });

    render(<GameControls {...props} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
