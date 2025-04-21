import { coverageConfigDefaults, defineConfig } from 'vitest/config';
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
        name: 'mirinae-react-storybook-test',
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
        },
        setupFiles: ['./.storybook/vitest.setup.ts'],
        coverage: {
            enabled: true,
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportOnFailure: true,
            exclude: [
                ...coverageConfigDefaults.exclude,
                '**/.storybook/**',
                // 👇 This pattern must align with the `stories` property of your `.storybook/main.ts` config
                '**/*.stories.*',
                // 👇 This pattern must align with the output directory of `storybook build`
                '**/storybook-static/**',
            ], 
            watermarks: {
              statements: [50, 80],
            }
        }
    },
});
