<template>
    <main :id="`${name}-container`" />
</template>

<script lang="ts">
import axios from 'axios';
import { onMounted, onUnmounted } from '@vue/composition-api';

export default {
    name: 'MicroFrontend',
    props: {
        name: {
            type: String,
            required: true,
        },
        host: {
            type: String,
            required: true,
        },
        history: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const scriptId = `micro-frontend-script-${props.name}`;

        const renderMicroFrontend = () => {
            if (window[`render${props.name}`]) window[`render${props.name}`](`${props.name}-container`, props.history);
            // E.g.: window.renderBrowse('browse-container', history);
        };

        (async () => {
            try {
                const res = await axios.get(`${props.host}/asset-manifest.json`);
                const manifest = res.data.json();
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = `${props.host}${manifest['main.js']}`;
                script.onload = renderMicroFrontend;
                document.head.appendChild(script);
            } catch (e) {
                console.error(e);
            }
        })();

        onMounted(() => {
            renderMicroFrontend();
        });

        onUnmounted(() => {
            if (window[`unmount${props.name}`]) window[`unmount${props.name}`](`${props.name}-container`);
        });

        return {};
    },
};
</script>

<style lang="postcss" scoped>

</style>
