import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@cloudforet/mirinae-react': resolve(__dirname, '../../packages/mirinae-react/src'),
        },
    },
});
