import { fireEvent, render, screen } from '@testing-library/react';
import InsurancePrompt from './InsurancePrompt';
import { GameState } from './enums';
import { createInsurancePromptProps } from '../test/factories';

describe('InsurancePrompt', () => {
  it('renders nothing when insurance is not being offered', () => {
    const props = createInsurancePromptProps({
      gameState: GameState.Play,
    });
    const { container } = render(<InsurancePrompt {...props} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/buy insurance/i)).not.toBeInTheDocument();
  });

  it('shows the insurance cost in the prompt', () => {
    const props = createInsurancePromptProps({
      insuranceCost: 7,
    });

    render(<InsurancePrompt {...props} />);

    expect(screen.getByText('Buy insurance for $7?')).toBeInTheDocument();
  });

  it('disables buying insurance when the bankroll cannot cover it', () => {
    const props = createInsurancePromptProps({
      canAffordInsurance: false,
    });

    render(<InsurancePrompt {...props} />);

    const buyButton = screen.getByRole('button', { name: 'Yes' });
    expect(buyButton).toBeDisabled();
    expect(buyButton).toHaveAttribute('title', 'Not enough chips to buy insurance');
    expect(screen.getByText('Not enough chips for insurance.')).toBeInTheDocument();

    fireEvent.click(buyButton);
    expect(props.onBuyInsurance).not.toHaveBeenCalled();
  });

  it('calls the buy handler when insurance is purchased', () => {
    const props = createInsurancePromptProps();

    render(<InsurancePrompt {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    expect(props.onBuyInsurance).toHaveBeenCalledTimes(1);
    expect(props.onDeclineInsurance).not.toHaveBeenCalled();
  });

  it('calls the decline handler when insurance is declined', () => {
    const props = createInsurancePromptProps();

    render(<InsurancePrompt {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'No' }));

    expect(props.onDeclineInsurance).toHaveBeenCalledTimes(1);
    expect(props.onBuyInsurance).not.toHaveBeenCalled();
  });
});
