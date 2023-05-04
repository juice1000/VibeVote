Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('Cypress login route', () => {
  it('logs in with spotify and creates a new playlist', () => {
    cy.visit('http://localhost:4200');
    cy.get('[data-cy="loginWithSpotify"]').click();
    cy.wait(500);
    cy.origin('https://accounts.spotify.com', () => {
      cy.get('input#login-username').click().type('julienlook@gmx.de');
      cy.get('input#login-password').click().type('Akai.smkf5');
      cy.get('#login-button').click();
    });
    cy.wait(500);
    cy.get('[data-cy="playListInput"]').click().type('habibi');
    cy.get('[data-cy="playListSubmit"]').click();
  });
});
