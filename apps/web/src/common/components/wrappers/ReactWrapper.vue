<script setup lang="ts">
import {
    defineProps, onMounted, onUnmounted, reactive, ref, useAttrs, onUpdated,
} from 'vue';

import { camelCase } from 'lodash';
import type React from 'react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

interface Props {
    component: React.FunctionComponent;
    children?: React.ReactNode;
    [string: string]: any;
}
const props = defineProps<Props>();
// const slots = useSlots();
const attrs = useAttrs();

const containerRef = ref<HTMLElement|undefined>();
const state = reactive({
    reactRoot: null as any|null,
});
const updateReactComponent = () => {
    if (state.reactRoot) {
        console.debug('------ updateReactComponent ------');
        const componentProps: any = {};
        Object.keys(attrs).forEach((key) => {
            componentProps[camelCase(key)] = attrs[key];
        });
        if (props.children) {
            componentProps.children = props.children;
        }
        // if (slots.default) {
        //      const vNode = slots.default();
        //      console.debug('vNode', vNode);
        //     // const children: React.ReactNode = createElement('span', {}, vNode);
        //     // componentProps.children
        // }
        console.debug('componentProps', componentProps);
        state.reactRoot.render(createElement(props.component, componentProps));
        console.debug('----------------------------------');
    }
};
onMounted(() => {
    if (!containerRef.value) return;
    state.reactRoot = createRoot(containerRef.value);
    console.debug('state.reactRoot', state.reactRoot);
    updateReactComponent();
});
onUnmounted(() => {
    if (state.reactRoot) {
        state.reactRoot.unmount();
        state.reactRoot = null;
    }
});
onUpdated(() => {
    updateReactComponent();
});
</script>

<template>
    <span ref="containerRef" />
</template>

