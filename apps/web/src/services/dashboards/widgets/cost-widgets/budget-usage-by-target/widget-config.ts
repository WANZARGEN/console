import { defineAsyncComponent } from 'vue';

import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetInheritOptions,
    getWidgetInheritOptionsForFilter,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const budgetUsageByTargetWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageByTarget',
    title: 'Budget Usage by Target',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/cost-widgets/budget-usage-by-target/BudgetUsageByTargetWidget.vue')),
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_WITH_FORECAST.DESC',
        preview_image: 'widget-img_budgetUsageWithForecast--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.YEARLY,
        cost_group_by: 'budget_id',
    },
    inherit_options: {
        ...getWidgetInheritOptions('cost_data_source'),
        ...getWidgetInheritOptionsForFilter(
            'provider',
            'project',
            'region',
            'cost_product',
        ),
    },
    options_schema: {
        default_properties: [
            'cost_data_source',
            ...getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'region',
                'cost_product',
            ),
        ],
        fixed_properties: ['cost_data_source'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source'),
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'cost_product',
                    'region',
                ),
            },
            order: [
                'cost_data_source',
                ...getWidgetFilterSchemaPropertyNames(
                    'provider',
                    'project',
                    'service_account',
                    'cost_product',
                    'region',
                ),
            ],
        },
    },
} as WidgetConfig;

export default budgetUsageByTargetWidgetConfig;
