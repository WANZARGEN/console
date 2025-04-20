import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        storybookTest({
            configDir: path.join(dirname, '.storybook'),
        }),
    ],
    test: {
        name: 'storybook',
        browser: {
            provider: 'playwright',
            instances: [
              { browser: 'chromium' },
            ],
            enabled: true,
            headless: true,
        },
        setupFiles: ['.storybook/vitest.setup.ts'],
    },
});
