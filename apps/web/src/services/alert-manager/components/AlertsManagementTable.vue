<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PLink, PBadge, PI, PSelectStatus, PDivider,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_STATUS, ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { gray, red } from '@/styles/colors';

import {
    alertStatusBadgeStyleTypeFormatter, calculateTime,
    getAlertStateI18n,
    getAlertUrgencyI18n,
} from '@/services/alert-manager/composables/alert-table-data';
import {
    ALERT_EXCEL_FIELDS,
    ALERT_MANAGEMENT_TABLE_FIELDS,
    ALERT_MANAGEMENT_TABLE_HANDLER,
    ALERT_STATUS_FILTERS,
} from '@/services/alert-manager/constants/alert-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { AlertFilterType } from '@/services/alert-manager/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;
const alertPageGetters = alertPageStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const userStore = useUserStore();
const userState = userStore.state;

const route = useRoute();

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo?.service_id),
    totalCount: computed<number>(() => alertPageState.totalAlertCount),
    alertList: computed<AlertModel[]>(() => alertPageState.alertList),
    timezone: computed<string>(() => userState.timezone || ''),
});
const state = reactive({
    loading: false,
    visibleCustomFieldModal: false,
    isServicePage: computed<boolean>(() => route.name === ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME),

    refinedAlertList: computed<AlertModel[]>(() => storeState.alertList.map((alert) => ({
        ...alert,
        created_at: iso8601Formatter(alert.created_at, storeState.timezone),
    }))),
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    defaultFields: computed<DataTableFieldType[]>(() => (state.isServicePage ? ALERT_MANAGEMENT_TABLE_FIELDS : [{ name: 'service_id', label: 'Service' }, ...ALERT_MANAGEMENT_TABLE_FIELDS])),
    fields: route.name === ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME ? ALERT_MANAGEMENT_TABLE_FIELDS : [{ name: 'service_id', label: 'Service' }, ...ALERT_MANAGEMENT_TABLE_FIELDS],
});
const filterState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
    selectedServiceId: '',
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'), name: ALERT_STATUS_FILTERS.IGNORED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
    ])),
    selectedStatusFilter: 'OPEN',
    urgencyFields: computed<SelectDropdownMenuItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgencyFilter: 'ALL',
    labelHandler: computed(() => makeDistinctValueHandler('alert_manager.Alert', 'labels')),
    selectedLabels: [] as SelectDropdownMenuItem[],
});

const alertListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);

const filterQueryHelper = new QueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getCreatedByNames = (id: string): string => {
    if (id.includes('webhook')) {
        return storeState.webhook[id].label || id;
    }
    return id;
};
const getServiceName = (id: string): TranslateResult => {
    if (filterState.serviceDropdownList.length === 0) return '';
    return filterState.serviceDropdownList.find((i) => i.name === id)?.label || '';
};
const handleSelectLabelsItem = (value: SelectDropdownMenuItem[]) => {
    filterState.selectedLabels = value;
    fetchAlertsList();
};
const handleSelectServiceDropdownItem = (id: string) => {
    filterState.selectedServiceId = id;
    fetchAlertsList();
};
const handleSelectFilter = (type: 'status' | 'urgency', value: string) => {
    if (type === 'status') {
        filterState.selectedStatusFilter = value;
    } else {
        filterState.selectedUrgencyFilter = value;
    }
    fetchAlertsList();
};
const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) alertListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) alertListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) alertListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchAlertsList();
};
const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};
const handleVisibleCustomFieldModal = (visible) => {
    state.visibleCustomFieldModal = visible;
};
const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};
const handleExportToExcel = async () => {
    await downloadExcel({
        url: '/alert-manager/alert/list',
        param: {
            query: { ...alertListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.alert,
        timezone: storeState.timezone,
    });
};

const fetchAlertsList = async () => {
    try {
        filterQueryHelper.setFilters([]);
        if (filterState.selectedStatusFilter === ALERT_STATUS_FILTERS.OPEN) {
            filterQueryHelper.addFilter({ k: 'status', v: [ALERT_STATUS_FILTERS.TRIGGERED, ALERT_STATUS_FILTERS.ACKNOWLEDGED], o: '=' });
        } else if (filterState.selectedStatusFilter !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'status', v: filterState.selectedStatusFilter, o: '=' });
        }
        if (filterState.selectedUrgencyFilter !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'urgency', v: filterState.selectedUrgencyFilter, o: '=' });
        }
        if (filterState.selectedLabels.length > 0) {
            filterQueryHelper.addFilter({ k: 'labels', v: filterState.selectedLabels.map((i) => i.name), o: '=' });
        }

        if (state.isServicePage) {
            filterQueryHelper.addFilter({ k: 'service_id', v: storeState.serviceId, o: '=' });
        } else if (filterState.selectedServiceId) {
            filterQueryHelper.addFilter({ k: 'service_id', v: filterState.selectedServiceId, o: '=' });
        }

        alertListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
            ...filterQueryHelper.filters,
        ]);

        const params = {
            query: alertListApiQueryHelper.data,
        };
        await alertPageStore.setAlertListParams(params);
        await alertPageStore.fetchAlertsList(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

watch(() => storeState.serviceId, async (serviceId) => {
    if (state.isServicePage && serviceId) {
        filterState.selectedServiceId = serviceId;
        await fetchAlertsList();
    }
});
watch(() => route.query, async (query) => {
    const { serviceId, status, urgency } = query;
    if (!state.isServicePage) {
        filterState.selectedServiceId = serviceId as string;
    }
    filterState.selectedStatusFilter = status as string || 'OPEN';
    filterState.selectedUrgencyFilter = urgency as string || 'ALL';

    try {
        state.loading = true;
        await fetchAlertsList();
    } finally {
        state.loading = false;
    }
}, { immediate: true });
</script>

<template>
    <div class="alert-data-table">
        <p-toolbox-table searchable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         class="toolbox pb-10"
                         :class="{'is-service-page': state.isServicePage}"
                         :sort-desc="true"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         :total-count="storeState.totalCount"
                         :fields="state.fields"
                         :items="state.refinedAlertList"
                         :key-item-sets="ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="ALERT_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="fetchAlertsList"
                         @export="handleExportToExcel"
        >
            <template v-if="!state.isServicePage"
                      #toolbox-top
            >
                <div class="filter-wrapper flex items-center gap-2 mt-6 ml-4">
                    <p-select-dropdown :menu="filterState.urgencyFields"
                                       :selection-label="$t('ALERT_MANAGER.ALERTS.LABEL_URGENCY')"
                                       style-type="rounded"
                                       use-fixed-menu-style
                                       :selected="filterState.selectedUrgencyFilter"
                                       class="service-dropdown"
                                       @update:selected="handleSelectFilter('urgency', $event)"
                    >
                        <template #menu-item--format="{ item }">
                            <p-i v-if="item.name !== 'ALL'"
                                 :name="item.name === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                                 width="1em"
                                 height="1em"
                                 class="mr-1"
                                 :color="item.name === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                            />
                            <span>{{ item.label }}</span>
                        </template>
                    </p-select-dropdown>
                    <p-divider vertical
                               class="divider"
                    />
                    <p-select-dropdown :menu="filterState.serviceDropdownList"
                                       :selection-label="$t('ALERT_MANAGER.ALERTS.SERVICE')"
                                       style-type="rounded"
                                       show-delete-all-button
                                       selection-highlight
                                       use-fixed-menu-style
                                       :selected="filterState.selectedServiceId"
                                       class="service-dropdown"
                                       @update:selected="handleSelectServiceDropdownItem"
                    />
                    <p-select-dropdown :selection-label="$t('ALERT_MANAGER.ALERTS.LABEL')"
                                       :handler="filterState.labelHandler"
                                       style-type="rounded"
                                       appearance-type="stack"
                                       show-delete-all-button
                                       selection-highlight
                                       use-fixed-menu-style
                                       :selected="filterState.selectedLabels"
                                       class="service-dropdown"
                                       @update:selected="handleSelectLabelsItem"
                    />
                </div>
            </template>
            <template #toolbox-bottom>
                <div class="quick-filter-wrapper flex flex-col mr-4 mb-4 ml-4 gap-2">
                    <div class="status-filter-wrapper">
                        <span class="label">{{ $t('ALERT_MANAGER.STATUS') }}</span>
                        <p-divider class="divider"
                                   vertical
                        />
                        <p-select-status v-for="(item, idx) in filterState.statusFields"
                                         :key="idx"
                                         :selected="filterState.selectedStatusFilter"
                                         :value="item.name"
                                         class="status"
                                         @change="handleSelectFilter('status', item.name)"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </div>
            </template>
            <template #col-service_id-format="{ value }">
                <template v-if="value">
                    <span>{{ getServiceName(value) }}</span>
                </template>
            </template>
            <template #col-title-format="{ value, item }">
                <template v-if="value">
                    <p-link highlight
                            :to="{
                                name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
                                params: {
                                    alertId: item.alert_id,
                                    serviceId: state.isServicePage ? storeState.serviceId : undefined,
                                }
                            }"
                    >
                        <span class="title-link">{{ value }}</span>
                    </p-link>
                </template>
            </template>
            <template #col-status-format="{ value }">
                <p-badge :style-type="alertStatusBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATUS.TRIGGERED ? 'solid' : 'subtle'"
                >
                    {{ state.alertStateLabels[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     class="mr-1"
                     :color="value === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                />
                <span>{{ state.urgencyLabels[value] }}</span>
            </template>
            <template #col-labels-format="{ value }">
                <div class="flex gap-2">
                    <p-badge v-for="(item, idx) in value?.slice(0, 3)"
                             :key="`labels-${idx}`"
                             badge-type="subtle"
                             style-type="gray200"
                             shape="square"
                             class="label-item"
                    >
                        <span>{{ item }}</span>
                    </p-badge>
                    <p-badge v-if="value?.length > 3"
                             badge-type="subtle"
                             style-type="blue200"
                    >
                        <span>+ {{ value?.length - 3 }}</span>
                    </p-badge>
                </div>
            </template>
            <template #col-triggered_by-format="{ value }">
                <span>{{ getCreatedByNames(value) }}</span>
            </template>
            <template #col-duration-format="{ item }">
                <span>{{ calculateTime(item?.created_at, storeState.timezone) }}</span>
            </template>
        </p-toolbox-table>
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            :resource-type="state.isServicePage ? 'service.alert' : 'alertManager.alert'"
                            :default-field="state.defaultFields"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="fetchAlertsList"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
    </div>
</template>

<style scoped lang="postcss">
.alert-data-table {
    .toolbox {
        border-radius: 0.375rem;
        &.is-service-page {
            border: none;
        }
    }
    .label-item {
        @apply truncate;
        max-width: 9.875rem;
    }
    .filter-wrapper {
        .divider {
            height: 1.375rem;
        }
        .service-dropdown {
            width: max-content;
        }
    }
    .quick-filter-wrapper {
        .status-filter-wrapper {
            @apply flex items-center flex-wrap text-label-sm;
            gap: 0.75rem;
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
            .label {
                @apply font-bold;
            }
            .divider {
                height: 1rem;
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
            .status {
                @apply text-label-md;
            }
        }

        @screen mobile {
            gap: 1rem;
            .status-filter-wrapper {
                margin-top: 0;
                .divider {
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }
    }
}
</style>
