import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { cloneDeep, isEmpty, sortBy } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CostQuerySetCreateParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/create';
import type { CostQuerySetUpdateParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/update';
import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { Currency } from '@/store/modules/display/type';
import { usePreferencesStore } from '@/store/preferences/preferences-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';


import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    DEFAULT_UNIFIED_COST_CURRENCY, GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP, UNIFIED_COST_KEY,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import { convertRelativePeriodToPeriod } from '@/services/cost-explorer/helpers/cost-explorer-period-helper';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';
import type {
    RelativePeriod, Granularity, GroupBy, Period,
    DisplayDataType,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


interface GroupByItem {
    name: GroupBy|string;
    label: string;
}

const getRefinedFilters = (consoleFilters?: ConsoleFilter[]): Record<string, string[]> => {
    if (!consoleFilters || isEmpty(consoleFilters)) return {};
    const result: Record<string, string[]> = {};
    (consoleFilters ?? []).forEach((d) => {
        result[d.k as string] = d.v as string[];
    });
    return result;
};

export const useCostAnalysisPageStore = defineStore('page-cost-analysis', () => {
    const allReferenceStore = useAllReferenceStore();
    const costQuerySetStore = useCostQuerySetStore();
    const costQuerySetGetters = costQuerySetStore.getters;
    const costQuerySetState = costQuerySetStore.state;
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const workspaceStoreGetters = userWorkspaceStore.getters;
    const domainConfigStore = usePreferencesStore();
    const domainConfigGetters = domainConfigStore.getters;

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        granularity: GRANULARITY.MONTHLY as Granularity,
        groupBy: [] as Array<GroupBy|string>,
        chartGroupBy: undefined as GroupBy|string|undefined,
        period: undefined as Period|undefined,
        relativePeriod: undefined as RelativePeriod|undefined,
        filters: {} as Record<string, string[]>,
        enabledFiltersProperties: undefined as string[]|undefined,
        displayDataType: 'cost' as DisplayDataType,
        isAllWorkspaceSelected: false,
        workspaceScope: undefined as string|undefined,
    });
    const getters = reactive({
        workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
        defaultWorkspaceScope: computed<string|undefined>(() => (workspaceStoreGetters.workspaceList[0]?.workspace_id)),
        selectedQueryId: computed(() => costQuerySetState.selectedQuerySetId),
        costQueryList: computed(() => costQuerySetState.costQuerySetList),
        selectedQuerySet: computed(() => costQuerySetGetters.selectedQuerySet),
        selectedDataSourceId: computed(() => costQuerySetState.selectedDataSourceId),
        isUnifiedCost: computed(() => getters.selectedDataSourceId === UNIFIED_COST_KEY),
        managedCostQuerySetList: computed(() => costQuerySetGetters.managedCostQuerySets),
        currency: computed<Currency>(() => {
            if (costQuerySetState.selectedDataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
                if (costQuerySetState.selectedDataSourceId === UNIFIED_COST_KEY) return (domainConfigGetters.unifiedCostConfig?.currency ?? DEFAULT_UNIFIED_COST_CURRENCY);
                return targetDataSource?.data?.plugin_info?.metadata?.currency ?? 'USD';
            }
            return 'USD';
        }),
        defaultGroupByItems: computed<GroupByItem[]>(() => {
            if (getters.metadataAdditionalInfoItems.length) {
                return [...getters.managedGroupByItems, ...getters.metadataAdditionalInfoItems];
            }
            return [...getters.managedGroupByItems, ...getters.additionalInfoKeysItems];
        }),
        managedGroupByItems: computed<GroupByItem[]>(() => {
            const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
            const metadataAdditionalInfo = targetDataSource?.data?.plugin_info?.metadata?.additional_info;
            let _additionalInfoGroupBy: GroupByItem[] = [];
            if (metadataAdditionalInfo && !isEmpty(metadataAdditionalInfo)) {
                _additionalInfoGroupBy = Object.entries(metadataAdditionalInfo)
                    .filter(([, value]) => value?.visible)
                    .map(([key, value]) => ({
                        name: `additional_info.${key}`,
                        label: value?.name,
                        presetKeys: metadataAdditionalInfo[key].enums,
                    }));
            } else {
                _additionalInfoGroupBy = cloneDeep(getters.additionalInfoKeysItems);
            }
            const _managedGroupByItems = _state.isAdminMode ? Object.values(GROUP_BY_ITEM_MAP) : Object.values(GROUP_BY_ITEM_MAP).filter((d) => d.name !== GROUP_BY.WORKSPACE);
            return [..._managedGroupByItems, ..._additionalInfoGroupBy];
        }),
        metadataAdditionalInfoItems: computed<GroupByItem[]>(() => {
            if (!costQuerySetState.selectedDataSourceId) return [];
            const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
            if (!targetDataSource) return [];
            const metadataAdditionalInfo = targetDataSource?.data?.plugin_info?.metadata?.additional_info;
            if (!metadataAdditionalInfo) return [];
            return Object.entries(metadataAdditionalInfo)
                .filter(([, value]) => !value?.visible)
                .map(([key, value]) => ({
                    name: `additional_info.${key}`,
                    label: value?.name,
                }));
        }),
        additionalInfoKeysItems: computed<GroupByItem[]>(() => {
            if (!costQuerySetState.selectedDataSourceId) return [];
            const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
            if (!targetDataSource) return [];
            const costAdditionalInfoKeys = targetDataSource?.data?.cost_additional_info_keys ?? [];
            const additionalInfoGroupBy: GroupByItem[] = costAdditionalInfoKeys
                .map((d) => ({
                    name: `additional_info.${d}`,
                    label: d,
                }));
            return [...sortBy(additionalInfoGroupBy, 'label')];
        }),
        consoleFilters: computed<ConsoleFilter[]>(() => {
            const results: ConsoleFilter[] = [];
            Object.entries(state.filters ?? {}).forEach(([category, filterItems]) => {
                if (filterItems.length) {
                    results.push({
                        k: category,
                        v: filterItems,
                        o: '=',
                    });
                }
            });
            if (_state.isAdminMode && !state.isAllWorkspaceSelected) {
                results.push({
                    k: GROUP_BY.WORKSPACE,
                    v: [state.workspaceScope ?? ''],
                    o: '=',
                });
            }
            return results;
        }),
        dataSourceImageUrl: computed<string>(() => {
            if (costQuerySetState.selectedDataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId ?? ''];
                return allReferenceStore.getters.plugin[targetDataSource?.data?.plugin_info?.plugin_id]?.icon;
            }
            return '';
        }),
        isPeriodInvalid: computed<boolean>(() => {
            const now = dayjs().utc();
            const checkPeriod = (limit:number):{isStartInvalid:boolean, isEndInvalid:boolean} => {
                const isStartInvalid = now.diff(state.period?.start, 'month') >= limit;
                const isEndInvalid = now.diff(state.period?.end, 'month') >= limit;
                return { isStartInvalid, isEndInvalid };
            };
            const DAILY_LIMIT_MONTH = 12;
            const OTHER_LIMIT_MONTH = 36;
            const isGranularityDaily = state.granularity === GRANULARITY.DAILY;
            const { isStartInvalid, isEndInvalid } = checkPeriod(isGranularityDaily ? DAILY_LIMIT_MONTH : OTHER_LIMIT_MONTH);
            return isStartInvalid || isEndInvalid;
        }),
    });

    /* Mutations */
    const setChartGroupBy = (groupBy: GroupBy|string|undefined) => {
        state.chartGroupBy = groupBy;
    };
    const setEnabledFiltersProperties = (enabledProperties: string[]) => {
        state.enabledFiltersProperties = enabledProperties;
    };
    const setFilters = (filters: Record<string, string[]>) => {
        state.filters = filters;
    };
    const setGranularity = (granularity: Granularity) => {
        state.granularity = granularity;
    };
    const setGroupBy = (groupBy: Array<GroupBy|string>) => {
        state.groupBy = groupBy;
    };
    const setPeriod = (period?: Period) => {
        state.period = period;
    };
    const setRelativePeriod = (relativePeriod?: RelativePeriod) => {
        state.relativePeriod = relativePeriod;
    };
    const setDisplayDataType = (dataType: DisplayDataType) => {
        state.displayDataType = dataType;
    };
    const setWorkspaceScope = (workspaceScope: string|undefined) => {
        state.workspaceScope = workspaceScope;
    };

    /* Actions */
    const reset = () => {
        state.granularity = GRANULARITY.MONTHLY;
        state.groupBy = [];
        state.chartGroupBy = undefined;
        state.period = undefined;
        state.relativePeriod = undefined;
        state.filters = {};
        state.enabledFiltersProperties = undefined;
        state.displayDataType = 'cost';
        state.isAllWorkspaceSelected = false;
        state.workspaceScope = getters.defaultWorkspaceScope ?? '';
    };
    const setQueryOptions = (options?: CostQuerySetModel['options']) => {
        reset();
        if (!options) return;

        if (options.granularity) state.granularity = options.granularity;

        state.groupBy = options.group_by ?? [];
        state.chartGroupBy = options.group_by?.[0];
        state.isAllWorkspaceSelected = options.is_all_workspace_selected ?? false;
        state.workspaceScope = options.workspace_scope ?? getters.defaultWorkspaceScope ?? '';

        if (options.relative_period) {
            state.relativePeriod = options.relative_period;
            state.period = convertRelativePeriodToPeriod({
                relativePeriod: options.relative_period,
                granularity: options.granularity,
            });
        } else if (options.period) {
            state.period = { start: options.period.start, end: options.period.end };
        }
        state.filters = getRefinedFilters(options.filters);
        state.displayDataType = options.display_data_type ?? 'cost';

        // check admin mode
        if (options.metadata?.filters_schema?.enabled_properties?.length) {
            if (_state.isAdminMode && options.is_all_workspace_selected) {
                state.enabledFiltersProperties = options.metadata.filters_schema.enabled_properties;
            } else {
                state.enabledFiltersProperties = options.metadata.filters_schema.enabled_properties
                    .filter((d) => d !== GROUP_BY.WORKSPACE);
            }
        } else {
            state.enabledFiltersProperties = getters.managedGroupByItems.map((d) => d.name);
        }
    };
    const saveQuery = async (name: string): Promise<CostQuerySetModel|undefined> => {
        const options: CostQuerySetModel['options'] = {
            granularity: state.granularity,
            period: state.period,
            relative_period: state.relativePeriod,
            group_by: state.groupBy,
            filters: getters.consoleFilters,
            display_data_type: state.displayDataType,
            workspace_scope: state.workspaceScope,
            is_all_workspace_selected: state.isAllWorkspaceSelected,
            metadata: { filters_schema: { enabled_properties: state.enabledFiltersProperties ?? [] } },
        };
        let createdData;
        try {
            createdData = await SpaceConnector.clientV2.costAnalysis.costQuerySet.create<CostQuerySetCreateParameters, CostQuerySetModel>({
                name,
                data_source_id: costQuerySetState.selectedDataSourceId as string,
                options,
            });
            selectQueryId(createdData.cost_query_set_id);
        } catch (e) {
            ErrorHandler.handleError(e);
        }
        return createdData;
    };
    const selectQueryId = (querySetId: string|undefined) => {
        costQuerySetStore.setSelectedQuerySetId(querySetId);
    };
    const editQuery = async (querySetId: string, name: string): Promise<CostQuerySetModel> => {
        let updatedQueryData;
        if (costQuerySetGetters.selectedQuerySet?.name !== name) {
            try {
                updatedQueryData = await SpaceConnector.clientV2.costAnalysis.costQuerySet.update<CostQuerySetUpdateParameters, CostQuerySetModel>({
                    cost_query_set_id: querySetId,
                    name,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        return updatedQueryData;
    };
    const getCostQueryList = async () => {
        await costQuerySetStore.listCostQuerySets();
    };

    const actions = {
        reset,
        setQueryOptions,
        saveQuery,
        selectQueryId,
        editQuery,
        getCostQueryList,
    };
    const mutations = {
        setChartGroupBy,
        setEnabledFiltersProperties,
        setFilters,
        setGranularity,
        setGroupBy,
        setPeriod,
        setRelativePeriod,
        setDisplayDataType,
        setWorkspaceScope,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
