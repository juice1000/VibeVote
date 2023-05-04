declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(): void;
      addSong(): void;
    }
  }
}

Cypress.Commands.add('login', () => {
  Cypress.log({
    name: 'loginViaAuth0',
  });
});

Cypress.Commands.add('addSong', () => {
  cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
  cy.get('.mt-2').click();
  cy.get('.add-track-btn').click();
  cy.get('.relative > .w-full').type('Tool The Pot{enter}');
  cy.wait(500);
  cy.get('.absolute > :nth-child(1)').click();
  // cy.get('[data-cy="card"]')
  //   .find('[data-cy="trackTitle"]')
  //   .then((items) => {
  //     const list = Array.from(items, (item) => item.innerText.toLowerCase());
  //     console.log(list);
  //     expect(list).to.include('tool');
  //     expect(list).to.include('the pot');
  //   });
});

export {};
