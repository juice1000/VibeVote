import type { Config } from '@jest/types';
import hq from 'alias-hq';

// Sync object
const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts', 'js'],
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json',
  //   },
  // },
  verbose: true,
  testMatch: ['**/tests/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  // setupFiles: ['./.env'], // maybe necessary to mock environment variables
  setupFilesAfterEnv: ['jest-extended/all'],
  moduleNameMapper: hq.get('jest'),
};

export default config;
