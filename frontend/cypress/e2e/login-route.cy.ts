import '../support/index.ts';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('Cypress login route', () => {
  it('logs in with spotify and creates a new playlist', () => {
    cy.visit('http://localhost:4200');
    cy.get('[data-cy="loginWithSpotify"]').click();
    cy.wait(300);
    cy.origin('https://accounts.spotify.com', () => {
      cy.get('input#login-username').click().type('julienlook@gmx.de');
      cy.get('input#login-password').click().type('Akai.smkf5');
      cy.get('#login-button').click();
    });
    cy.wait(500);
    cy.get('[data-cy="playListInput"]').click().type('habibi');
    cy.get('[data-cy="playListSubmit"]').click();

    // cy.addSong();
  });

  // it('should be able to add a song', () => {
  //   cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
  //   cy.get('.mt-2').click();

  //   cy.get('.add-track-btn').click();
  //   cy.get('.relative > .w-full').type('Tool The Pot{enter}');
  //   cy.wait(500);
  //   cy.get('.absolute > :nth-child(1)').click();
  //   cy.get('[data-cy="card"]')
  //     .find('[data-cy="trackTitle"]')
  //     .then((items) => {
  //       const list = Array.from(items, (item) => item.innerText.toLowerCase());
  //       console.log(list);
  //       expect(list).to.include('tool');
  //       expect(list).to.include('the pot');
  //     });
  // });
  // it('user should be able to vote', () => {
  //   cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
  //   cy.get('.mt-2').click();
  //   let voteCount = cy.get('.pt-2 > :nth-child(2)').find('button');
  //   console.log('voteCount' + voteCount);
  //   cy.get('.pt-2 > :nth-child(2)').find('button').click();
  //   cy.get('.justify-between > .px-4').click();
  // });
});
