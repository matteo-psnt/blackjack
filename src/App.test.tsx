import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./components/Game', () => ({
  default: () => <div>Blackjack table</div>,
}));

describe('App', () => {
  it('shows the title screen before entering the table', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Blackjack' })).toBeInTheDocument();
    expect(screen.queryByText('Blackjack table')).not.toBeInTheDocument();
  });

  it('enters the table after pressing start', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));

    expect(await screen.findByText('Blackjack table')).toBeInTheDocument();
  });
});
