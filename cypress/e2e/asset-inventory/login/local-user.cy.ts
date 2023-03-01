describe('Local user sign in', () => {
    it('go to sign in page', () => {
        cy.viewport('macbook-13');

        cy.log('go to root page!!');
        cy.visit('/');

        cy.log('enter user information');
        cy.get('.p-field-group:nth-child(1) input').type(Cypress.env('userId'));
        cy.get('.p-field-group:nth-child(2) input').type(Cypress.env('userPassword'));

        cy.log('click sign in button');
        cy.get('.p-button').click();

        cy.intercept('/identity/user/get').as('getUser');
        cy.wait('@getUser');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);// this is for waiting url replacement
        cy.log('assert whether the url changed to the next page');
        cy.url().should('eq', `${Cypress.config().baseUrl}/home-dashboard`);

        cy.log('store user data into local storage');
        cy.readFile('cypress/fixtures/user.json').then((data) => {
            cy.getAllLocalStorage().then((storageData) => {
                data.localStorage = storageData;
                cy.writeFile('cypress/fixtures/user.json', JSON.stringify(data));
            });
        });
    });
});
