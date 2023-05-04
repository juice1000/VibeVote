import '../support/index.ts';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('Cypress no-login route', () => {
  it('should navigate non-logged-in user, add track, vote and play', () => {
    cy.visit('http://localhost:4200/');
    cy.get('[data-cy="partyInput"]').type('0aHQgQmiE8mf5XN6YMZ3E4');
    cy.get('.mt-2').click();

    cy.wait(500);

    // only works if track is not there yet
    const currentTracks: string[] = [];
    cy.get('[data-cy="card"]')
      .find('[data-cy="trackTitle"]')
      .then((items) => {
        Array.from(items, (item) =>
          currentTracks.push(item.innerText.toLowerCase())
        );
      });
    cy.wait(500);
    if (currentTracks[0] === 'the pot') {
      // somehow includes is not working here
      console.log(currentTracks, currentTracks.includes('the pot'));
      cy.log('ADDING TRACK');
      cy.addTrack();
      cy.get('[data-cy="card"]')
        .find('[data-cy="trackTitle"]')
        .then((items) => {
          const list = Array.from(items, (item) =>
            item.innerText.toLowerCase()
          );
          console.log(list);
          expect(list).to.include('tool');
          expect(list).to.include('the pot');
        });
    }

    cy.wait(500);
    cy.vote();
    cy.wait(500);
    cy.play();
  });
});
