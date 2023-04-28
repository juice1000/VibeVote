import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts', 'js'],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json',
    },
  },
  verbose: true,
  testMatch: ['**/tests/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['jest-extended/all'],
};

export default config;
