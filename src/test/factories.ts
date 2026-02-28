import type { ComponentProps } from 'react';
import { vi, type Mock } from 'vitest';
import GameControls from '../components/GameControls';
import InsurancePrompt from '../components/InsurancePrompt';
import { GameState, PlayState } from '../components/enums';

type GameControlsProps = ComponentProps<typeof GameControls>;
type InsurancePromptProps = ComponentProps<typeof InsurancePrompt>;
type GameControlsTestProps = Omit<
  GameControlsProps,
  'hit' | 'stand' | 'split' | 'double' | 'setGameState'
> & {
  hit: Mock;
  stand: Mock;
  split: Mock;
  double: Mock;
  setGameState: Mock;
};
type InsurancePromptTestProps = Omit<InsurancePromptProps, 'setGameState' | 'setCurrentBalance'> & {
  setGameState: Mock;
  setCurrentBalance: Mock;
};

export function resolveStateSetterValue<T>(update: T | ((value: T) => T), currentValue: T): T {
  return typeof update === 'function' ? (update as (value: T) => T)(currentValue) : update;
}

export function createGameControlsProps(
  overrides: Partial<GameControlsTestProps> = {},
): GameControlsTestProps {
  return {
    hit: vi.fn(),
    stand: vi.fn(),
    split: vi.fn(),
    double: vi.fn(),
    setGameState: vi.fn(),
    gameState: GameState.Betting,
    currentBet: 10,
    playState: PlayState.None,
    ...overrides,
  };
}

export function createInsurancePromptProps(
  overrides: Partial<InsurancePromptTestProps> = {},
): InsurancePromptTestProps {
  return {
    gameState: GameState.Insurance,
    setGameState: vi.fn(),
    setCurrentBalance: vi.fn(),
    currentBalance: 100,
    betAmount: 20,
    dealerHas21: false,
    ...overrides,
  };
}
