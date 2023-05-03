Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('Cypress login route', () => {
  it('should navigate to the login', () => {
    cy.visit('http://localhost:4200');
    cy.get('#loginWithSpotify').click();
  });
});
