/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    interface Chainable<Subject> {
        login(domainId?, userId?, password?): Chainable<Subject>
    }
}

Cypress.Commands.add('login', (domainName, userId, password) => {
    cy.session([domainName, userId, password], () => {
        // cy.request({
        //     method: 'POST',
        //     url: 'https://console.api.dev.spaceone.dev/identity/domain/list',
        //     body: {
        //         name: domainName,
        //     },
        // }).then(({ body: { results: domainList } }) => {
        //     cy.request({
        //         method: 'POST',
        //         url: 'https://console.api.dev.spaceone.dev/identity/token/issue',
        //         body: {
        //             domain_id: domainList[0].domain_id,
        //             user_id: userId,
        //             user_type: 'USER',
        //             credentials: {
        //                 password,
        //             },
        //         },
        //     }).then(({ body }) => {
        //         window.localStorage.setItem('SpaceConnector/accessToken', body.access_token);
        //         window.localStorage.setItem('SpaceConnector/refreshToken', body.refresh_token);
        //     });
        // });

        cy.fixture('user.json').then((fixtureData) => {
            const data = fixtureData.localStorage?.[Cypress.config().baseUrl ?? ''];
            if (data) {
                Object.keys(data).forEach((key) => {
                    const value = data[key];
                    cy.log(key, value);
                    window.localStorage.setItem(key, value);
                });
            }
        });
    });
});
