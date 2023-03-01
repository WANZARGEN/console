import { defineConfig } from 'cypress';

export default defineConfig({
    projectId: '6uw4eo',
    e2e: {
        experimentalStudio: true,
        baseUrl: 'http://localhost:8080',
        specPattern: [
            '**/login/**/*.cy.ts',
            '**/asset-inventory/**/*.cy.ts',
        ],
    },
});
