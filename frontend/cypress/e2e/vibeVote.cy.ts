Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('VibeVote', () => {
  beforeEach(() => {});
  xit('should navigate to the login page', () => {
    // console.log(cy.get('.p-12 > .text-3xl'));
    cy.visit('http://localhost:4200/login');
    cy.get('[data-cy="partyInput"]').type('2rsqrLzUVHWx1Z2JmrZEMv');
    cy.get('.mt-2').click();
  });

  xit('should be able to add a song', () => {
    cy.visit('http://localhost:4200/login');
    cy.get('[data-cy="partyInput"]').type('2rsqrLzUVHWx1Z2JmrZEMv');
    cy.get('.mt-2').click();
    cy.wait(1000);
    // cy.get('[data-cy="partyInput"]').type('6oZDCanh1AozI2LdFG0Cbj');
    // cy.get('.mt-2').click();

    cy.get('.add-track-btn').click();
    cy.get('.relative > .w-full').type('Tool The Pot{enter}');
    cy.wait(1000);
    cy.get('.absolute > :nth-child(1)').click();
    cy.wait(1000);
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
    cy.visit('http://localhost:4200/login');
    cy.get('[data-cy="partyInput"]').type('2rsqrLzUVHWx1Z2JmrZEMv');
    cy.wait(1000);
    cy.get('.mt-2').click();
    let count = 0;
    let voteCount = cy
      .get(':nth-child(1) > .justify-between')
      .find('[data-cy="voteNum"]')
      .invoke('text')
      .then(text => {
        console.log(text.match(/\d+/));
        count += text.match(/\d+/);
      });
    cy.get(':nth-child(1) > .justify-between > .px-4').click();
    let newCount = cy
      .get(':nth-child(1) > .justify-between')
      .find('[data-cy="voteNum"]')
      .invoke('text')

      .then(text => {
        let count = text.match(/\d+/);
        return count;
      });
    expect(newCount).to.equal(count + 1);
  });
});
