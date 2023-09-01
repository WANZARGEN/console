import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import type { CostQuerySetModel, Period } from '@/services/cost-explorer/type';

export const MANAGED_COST_QUERY_SET_IDS = {
    MONTHLY_PROJECT: 'Monthly cost by project',
    MONTHLY_SERVICE_ACCOUNT: 'Monthly cost by service account',
    MONTHLY_PRODUCT: 'Monthly cost by product',
} as const;

export const managedCostQuerySetIdList: string[] = [
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_SERVICE_ACCOUNT,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
];

const defaultPeriod: Period = getInitialDates();

export const managedCostQuerySets: CostQuerySetModel[] = [
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        options: {
            group_by: [GROUP_BY.PROJECT],
            granularity: GRANULARITY.MONTHLY,
            period: defaultPeriod,
        },
    },
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_SERVICE_ACCOUNT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_SERVICE_ACCOUNT,
        options: {
            group_by: [GROUP_BY.SERVICE_ACCOUNT],
            granularity: GRANULARITY.MONTHLY,
            period: defaultPeriod,
        },
    },
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        options: {
            group_by: [GROUP_BY.PRODUCT],
            granularity: GRANULARITY.MONTHLY,
            period: defaultPeriod,
        },
    },
];