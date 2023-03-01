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

        cy.log('click general account filter');
        cy.get('.account-type-filter :nth-child(4) > .text')
            .click();
        cy.intercept('identity/service-account/list').as('listServiceAccount');
        cy.wait('@listServiceAccount');

        const itemTitle = 'SpaceONE Staging';
        const itemId = 'sa-2b171ff791ae';
        cy.log(`click '${itemTitle}'`);
        cy.get('.p-dynamic-layout-query-search-table table :nth-child(1) > :nth-child(1) > .p-dynamic-field-text')
            .get('[data-index="0"] > :nth-child(1)')
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

        cy.log('project should not be N/A');
        cy.get('.service-account-project-detail').should('not.eq', 'N/A');
    });
});
