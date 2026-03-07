import { fireEvent, render, screen } from '@testing-library/react';
import GameControls from './GameControls';
import { GameState, PlayState } from '../game/model';
import { createGameControlsProps } from '../test/factories';

describe('GameControls', () => {
  it('disables dealing when no bet has been staged', () => {
    const props = createGameControlsProps({
      canDeal: false,
      gameState: GameState.Betting,
    });

    render(<GameControls {...props} />);

    const dealButton = screen.getByRole('button', { name: 'Deal' });
    expect(dealButton).toBeDisabled();

    fireEvent.click(dealButton);
    expect(props.deal).not.toHaveBeenCalled();
  });

  it('starts dealing when a bet has been staged', () => {
    const props = createGameControlsProps({
      canDeal: true,
      gameState: GameState.Betting,
    });

    render(<GameControls {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Deal' }));

    expect(props.deal).toHaveBeenCalledTimes(1);
  });

  it('disables split and double when the table rules do not allow the wager', () => {
    const props = createGameControlsProps({
      canDouble: false,
      canSplit: false,
      gameState: GameState.Play,
      playState: PlayState.CanSplit,
    });

    render(<GameControls {...props} />);

    expect(screen.getByRole('button', { name: 'Split' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Double' })).toBeDisabled();
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

  it('shows a bust status instead of action buttons when the hand is over 21', () => {
    const props = createGameControlsProps({
      gameState: GameState.Play,
      playState: PlayState.Bust,
    });

    render(<GameControls {...props} />);

    expect(screen.getByRole('status')).toHaveTextContent('Busted');
    expect(screen.queryByRole('button', { name: 'Hit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Stand' })).not.toBeInTheDocument();
  });

  it('renders no controls outside betting and play', () => {
    const props = createGameControlsProps({
      gameState: GameState.DealerPlay,
    });

    render(<GameControls {...props} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
