import type { PokemonNumber } from './pokemon';

export const DIFFICULTY = {
  EASY: 4,
  NORMAL: 0,
  ULTRA: 1,
  MASTER: 2,
  ELITE: 3,
} as const;

export type DifficultyKey = keyof typeof DIFFICULTY;
export type Difficulty = typeof DIFFICULTY[DifficultyKey];

export type GenerationId = 1 | 2 ;

export type Generation = {
  id: GenerationId;
  start: PokemonNumber;
  end: PokemonNumber;
  supportedDifficulties: readonly Difficulty[];
  games: string;
};

export const GENERATIONS: { [key in GenerationId]: Generation } = {
  1: {
    id: 1,
    start: 1,
    end: 79,
    supportedDifficulties: [DIFFICULTY.NORMAL, DIFFICULTY.ULTRA, DIFFICULTY.MASTER, DIFFICULTY.ELITE, DIFFICULTY.EASY],
    games: 'Spectrobes 1 Roster',
  },
  2: {
    id: 2,
    start: 73,
    end: 154,
    supportedDifficulties: [DIFFICULTY.NORMAL, DIFFICULTY.ULTRA, DIFFICULTY.MASTER, DIFFICULTY.ELITE, DIFFICULTY.EASY],
    games: 'Beyond the Portals Additions',
  },
  /* 3: {
    id: 3,
    start: 252,
    end: 386,
    supportedDifficulties: [DIFFICULTY.NORMAL, DIFFICULTY.ULTRA, DIFFICULTY.MASTER, DIFFICULTY.ELITE, DIFFICULTY.EASY],
    games: 'Ruby, Sapphire, & Emerald',
  }, */
} as const;

export const MILLISECONDS_BETWEEN_POKEMON = 4500;
