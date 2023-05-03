import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
  },

  env: {
    username: 'julienlook@gmx.de',
    password: 'Akai.smkf5',
    authUrl: 'https://accounts.spotify.com/en/login',
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
