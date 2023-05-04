declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(): void;
      addTrack(): void;
      vote(): void;
      play(): void;
      checkTrack(): void;
    }
  }
}

Cypress.Commands.add('login', () => {
  Cypress.log({
    name: 'loginViaAuth0',
  });
});

Cypress.Commands.add('addTrack', () => {
  cy.get('.add-track-btn').click();
  cy.get('.relative > .w-full').type('Shakira{enter}');
  cy.get('.absolute > :nth-child(1)').click();
});

Cypress.Commands.add('checkTrack', () => {
  cy.get('[data-cy="card"]')
    .find('[data-cy="trackTitle"]')
    .then((items) => {
      const list = Array.from(items, (item) => item.innerText.toLowerCase());
      console.log(list);
      expect(list).to.include('tool');
      expect(list).to.include('the pot');
    });
});

Cypress.Commands.add('vote', () => {
  let currentVote: number;
  cy.get(
    'body > app-root > app-playlist > div > div:nth-child(2) > div > div > div > button'
  ).then(function ($elem) {
    // expect($elem.text()).to.equal(' Vote (0) ');
    const match = $elem.text().match(/\d/);
    if (match) {
      currentVote = parseInt(match[0]);
    }
  });

  cy.get(
    'body > app-root > app-playlist > div > div:nth-child(2) > div > div > div > button'
  ).click();

  cy.wait(2000);
  cy.get(
    'body > app-root > app-playlist > div > div:nth-child(2) > div > div > div > button'
  ).then(function ($elem) {
    expect($elem.text()).to.equal(` Vote (${currentVote + 1}) `);
  });
});

Cypress.Commands.add('play', () => {
  cy.get('#play-button').click();
});

export {};
