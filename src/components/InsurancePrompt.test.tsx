import { fireEvent, render, screen } from '@testing-library/react';
import InsurancePrompt from './InsurancePrompt';
import { GameState } from './enums';
import { createInsurancePromptProps, resolveStateSetterValue } from '../test/factories';

describe('InsurancePrompt', () => {
  it('renders nothing when insurance is not being offered', () => {
    const props = createInsurancePromptProps({
      gameState: GameState.Play,
    });
    const { container } = render(<InsurancePrompt {...props} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Do you want to buy insurance?')).not.toBeInTheDocument();
  });

  it('pays insurance on odd bets when the dealer has blackjack', () => {
    const props = createInsurancePromptProps({
      betAmount: 15,
      currentBalance: 100,
      dealerHas21: true,
    });

    render(<InsurancePrompt {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    expect(props.setCurrentBalance).toHaveBeenCalledTimes(1);

    const balanceUpdate = props.setCurrentBalance.mock.calls[0][0];
    expect(resolveStateSetterValue(balanceUpdate, props.currentBalance)).toBe(107);
    expect(props.setGameState).toHaveBeenCalledWith(GameState.DealerPlay);
  });

  it('charges insurance when the dealer does not have blackjack', () => {
    const props = createInsurancePromptProps({
      betAmount: 15,
      currentBalance: 100,
      dealerHas21: false,
    });

    render(<InsurancePrompt {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    expect(props.setCurrentBalance).toHaveBeenCalledTimes(1);

    const balanceUpdate = props.setCurrentBalance.mock.calls[0][0];
    expect(resolveStateSetterValue(balanceUpdate, props.currentBalance)).toBe(93);
    expect(props.setGameState).toHaveBeenCalledWith(GameState.Play);
  });

  it.each([
    [true, GameState.DealerPlay],
    [false, GameState.Play],
  ])(
    'skips the balance update when insurance is declined (dealerHas21=%s)',
    (dealerHas21: boolean, nextState: GameState) => {
      const props = createInsurancePromptProps({
        dealerHas21,
      });

      render(<InsurancePrompt {...props} />);
      fireEvent.click(screen.getByRole('button', { name: 'No' }));

      expect(props.setCurrentBalance).not.toHaveBeenCalled();
      expect(props.setGameState).toHaveBeenCalledWith(nextState);
    },
  );
});
