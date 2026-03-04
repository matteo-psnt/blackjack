import type { ComponentProps } from 'react';
import { vi, type Mock } from 'vitest';
import GameControls from '../components/GameControls';
import InsurancePrompt from '../components/InsurancePrompt';
import { GameState, PlayState } from '../components/enums';

type GameControlsProps = ComponentProps<typeof GameControls>;
type InsurancePromptProps = ComponentProps<typeof InsurancePrompt>;
type GameControlsTestProps = Omit<
  GameControlsProps,
  'deal' | 'double' | 'hit' | 'split' | 'stand'
> & {
  deal: Mock;
  double: Mock;
  hit: Mock;
  split: Mock;
  stand: Mock;
};
type InsurancePromptTestProps = Omit<
  InsurancePromptProps,
  'onBuyInsurance' | 'onDeclineInsurance'
> & {
  onBuyInsurance: Mock;
  onDeclineInsurance: Mock;
};

export function createGameControlsProps(
  overrides: Partial<GameControlsTestProps> = {},
): GameControlsTestProps {
  return {
    hit: vi.fn(),
    stand: vi.fn(),
    split: vi.fn(),
    double: vi.fn(),
    deal: vi.fn(),
    gameState: GameState.Betting,
    playState: PlayState.None,
    canDeal: true,
    canDouble: true,
    canSplit: true,
    ...overrides,
  };
}

export function createInsurancePromptProps(
  overrides: Partial<InsurancePromptTestProps> = {},
): InsurancePromptTestProps {
  return {
    gameState: GameState.Insurance,
    onBuyInsurance: vi.fn(),
    onDeclineInsurance: vi.fn(),
    insuranceCost: 10,
    canAffordInsurance: true,
    ...overrides,
  };
}
