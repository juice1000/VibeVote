Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('VibeVote', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/login');
  });
  it('should navigate to the login page', () => {
    // console.log(cy.get('.p-12 > .text-3xl'));
    cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
    cy.get('.mt-2').click();
  });

  it('should be able to add a song', () => {
    cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
    cy.get('.mt-2').click();

    cy.get('.add-track-btn').click();
    cy.get('.relative > .w-full').type('Tool The Pot{enter}');
    cy.wait(1000);
    cy.get('.absolute > :nth-child(1)').click();
    cy.get('[data-cy="card"]')
      .find('[data-cy="trackTitle"]')
      .then(items => {
        const list = Array.from(items, item => item.innerText.toLowerCase());
        console.log(list);
        expect(list).to.include('tool');
        expect(list).to.include('the pot');
      });
  });
  it('user should be able to vote', () => {
    cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
    cy.get('.mt-2').click();
    let voteCount = cy.get('.pt-2 > :nth-child(2)').find('button');
    console.log('voteCount' + voteCount);
    cy.get('.pt-2 > :nth-child(2)').find('button').click();
    cy.get('.justify-between > .px-4').click();
  });
});
