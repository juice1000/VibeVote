Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe('Cypress login route', () => {
  it('should navigate to login', () => {
    cy.visit('http://localhost:4200');
    cy.get('[data-cy="loginWithSpotify"]').click();
  });

  it('logs in with spotify', () => {
    //   cy.visit('https://accounts.spotify.com/en/login');
    //   cy.get('input#login-username').click().type(Cypress.env('username'));
    //   cy.get('input#login-password').click().type(Cypress.env('password'));
    //   cy.get('#login-button').click();
    // const options = {
    //   method: 'POST',
    //   url: Cypress.env('authUrl'),
    //   body: {
    //     grant_type: 'password',
    //     username: Cypress.env('username'),
    //     password: Cypress.env('password'),
    //     //   audience: Cypress.env('auth_audience'),
    //     //   scope: 'openid profile email',
    //     //   client_id: Cypress.env('auth_client_id'),
    //     //   client_secret: Cypress.env('auth_client_secret'),
    //   },
    //   headers: {
    //     Referer: 'https://accounts.spotify.com/',
    //     'User-Agent':
    //       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    //     'content-type': 'application/json',
    //     'sec-ch-ua':
    //       '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
    //     'sec-ch-ua-mobile': '?0',
    //     'sec-ch-ua-platform': '"macOS"',
    //   },
    // };
    // cy.request(options)
    //   .then((res: any) => {
    //     return res.body;
    //   })
    //   .then((body: any) => {
    //     console.log(body);
    //     const { access_token, expires_in, id_token } = body;
    //   });
  });

  // it('go create a new playlist', () => {
  //   cy.visit('http://localhost:4200/home');
  //   cy.get('[data-cy="playListInput"]').click().type('cypressTest');
  //   cy.get('[data-cy="playListSubmit"]').click();
  // });
});
