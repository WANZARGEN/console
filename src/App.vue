<template>
    <div v-cloak id="app">
        <router-view />
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';

export default defineComponent({
    name: 'SpotAutomationApp',
    setup() {
        return {
        };
    },
});

</script>
