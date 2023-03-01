describe('Trusted account', () => {
    it('check trusted account', () => {
        cy.login();
        cy.viewport('macbook-13');
        cy.visit('/asset-inventory/service-account');

        // cy.login(Cypress.env('domainName'), Cypress.env('userId'), Cypress.env('userPassword'));

        cy.intercept('identity/provider/list').as('listProvider');
        cy.wait('@listProvider');

        cy.log('click AWS');
        cy.get('.service-account-provider-list > :nth-child(2)').click();
        cy.intercept('identity/service-account/list').as('listServiceAccount');
        cy.wait('@listServiceAccount');

        cy.log('click trusted account filter');
        cy.get('.account-type-filter').get(':nth-child(3) > .text').click();
        cy.intercept('identity/service-account/list').as('listServiceAccount');
        cy.wait('@listServiceAccount');

        const itemTitle = 'SpaceONE AWS Trusted Account';
        const itemId = 'sa-097f2df2ee3a';
        cy.log(`click '${itemTitle}'`);
        cy.get('.p-dynamic-layout-query-search-table table :nth-child(1) > :nth-child(1) > .p-dynamic-field-text')
            .click();

        cy.log('should go to detail page');
        cy.intercept('identity/service-account/get').as('getServiceAccount');
        cy.wait('@getServiceAccount');
        cy.get('.right-container > .header .current-page').invoke('text').should((text) => {
            expect(text.trim()).to.eq(itemId);
        });
        cy.url().should('eq', `${Cypress.config().baseUrl}/asset-inventory/service-account/${itemId}`);


        // cy.log(`page title should be '${itemTitle}'`);
        // cy.get('.service-account-detail-page .page-title .title')
        //     .invoke('text')
        //     .should((text) => {
        //         expect(text.trim()).to.eq(itemTitle);
        //     });

        cy.log('trust account should not have project');
        cy.get('.service-account-project-detail').should('have.text', 'N/A');
    });
});
