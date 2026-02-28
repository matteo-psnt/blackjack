import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./components/Game', () => ({
  default: () => <div>Blackjack table</div>,
}));

describe('App', () => {
  it('renders the game shell', () => {
    render(<App />);

    expect(screen.getByText('Blackjack table')).toBeInTheDocument();
  });
});
