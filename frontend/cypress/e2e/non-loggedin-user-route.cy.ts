import '../support/index.ts';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('Cypress no-login route', () => {
  it('should navigate non-logged-in user, add track, vote and play', () => {
    cy.visit('http://localhost:4200/');
    cy.get('[data-cy="partyInput"]').type('2VLOJ3rKDJp2Wu0TVk5Mlb');
    cy.get('.mt-2').click();

    cy.wait(500);

    // only works if track is not there yet
    const currentTracks: string[] = [];
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="card"]').length > 0) {
        cy.get('[data-cy="card"]')
          .find('[data-cy="trackTitle"]')
          .then((items) => {
            Array.from(items, (item) =>
              currentTracks.push(item.innerText.toLowerCase())
            );
            if (!currentTracks.includes('the pot')) {
              cy.log('ADDING TRACK');
              cy.addTrack();
              cy.wait(500);
              cy.checkTrack();
            }
          });
      } else {
        cy.log('ADDING TRACK');
        cy.addTrack();
        cy.wait(500);
        cy.checkTrack();
      }
    });

    cy.wait(500);
    cy.vote();
    cy.wait(500);
    cy.play();
  });
});
