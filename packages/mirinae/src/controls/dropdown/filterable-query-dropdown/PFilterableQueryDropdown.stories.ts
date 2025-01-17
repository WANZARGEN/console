import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getKeyItemSets, getValueHandlerMap } from '@/controls/dropdown/filterable-query-dropdown/mock';
import PFilterableQueryDropdown from '@/controls/dropdown/filterable-query-dropdown/PFilterableQueryDropdown.vue';
import { getFilterableQueryDropdownArgs, getFilterableQueryDropdownParameters, getFilterableQueryDropdownArgTypes } from '@/controls/dropdown/filterable-query-dropdown/story-helper';
import { useProxyValue } from '@/hooks';

type PFilterableQueryDropdownPropsAndCustomArgs = ComponentProps<typeof PFilterableQueryDropdown>;

const meta : Meta<PFilterableQueryDropdownPropsAndCustomArgs> = {
    title: 'Controls/Dropdown/Filterable Query Dropdown',
    component: PFilterableQueryDropdown,
    argTypes: {
        ...getFilterableQueryDropdownArgTypes(),
    },
    parameters: {
        ...getFilterableQueryDropdownParameters(),
    },
    args: {
        ...getFilterableQueryDropdownArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PFilterableQueryDropdown>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown v-model="proxyValue"
                                :keyItemSets="keyItemSets"
                                :valueHandlerMap="valueHandlerMap"
                ></p-filterable-query-dropdown>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyValue: useProxyValue('value', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                ></p-filterable-query-dropdown>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(5, 1);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const MultiSelectable: Story = {
    render: () => ({
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    multi-selectable
                ></p-filterable-query-dropdown>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(5, 1);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const UseFixedMenuStyle: Story = {
    render: () => ({
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    use-fixed-menu-style
                    multi-selectable
                ></p-filterable-query-dropdown>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(5, 1);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};
