<template>
    <div>
        <p v-if="!isEditMode" class="content-wrapper">
            <span class="project">
                <p-anchor :to="referenceRouter(
                              alertData.project_id,
                              { resource_type: 'identity.Project' })"
                          highlight
                >
                    {{ projects[alertData.project_id] ? projects[alertData.project_id].label : alertData.project_id }}
                </p-anchor>
            </span>
            <p-button style-type="gray-border" size="sm" class="add-button"
                      @click="startEdit(EDIT_MODE.PROJECT)"
            >
                {{ $t('MONITORING.ALERT.DETAIL.INFO.CHANGE') }}
            </p-button>
        </p>
        <div v-else class="content-wrapper">
            <project-select-dropdown :selected-project-ids="dataForUpdate ? [dataForUpdate] : []"
                                     @select="onSelectProject"
            />
            <div class="button-group">
                <p-button :outline="true" size="sm" class="cancel-button"
                          @click="cancelEdit(EDIT_MODE.PROJECT)"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="sm"
                    @click="openModal"
                >
                    {{ $t('MONITORING.ALERT.DETAIL.INFO.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <p-button-modal
            :header-title="$t('MONITORING.ALERT.DETAIL.INFO.CHANGE_PROJECT_MODAL_TITLE')"
            centered
            size="sm"
            fade
            :scrollable="false"
            backdrop
            theme-color="alert"
            :visible.sync="modalVisible"
            @confirm="onClickSave(EDIT_MODE.PROJECT)"
        >
            <template #body>
                {{$t('MONITORING.ALERT.DETAIL.INFO.CHANGE_PROJECT_MODAL_DESC')}}
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts">
import {
    PTextarea, PButton, PI, PAnchor, PButtonModal,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { useAlertDetailItem } from '@/views/monitoring/alert-manager/modules/alert-detail/hooks';
import { EDIT_MODE } from '@/views/monitoring/alert-manager/lib/config';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import ProjectSelectDropdown from '@/common/modules/project-select-dropdown/ProjectSelectDropdown.vue';

export default {
    name: 'AlertDetailInfoProject',
    components: {
        ProjectSelectDropdown,
        PAnchor,
        PButton,
        PButtonModal,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const {
            state: alertDetailItemState,
            cancelEdit,
            startEdit,
            updateAlert,
            onClickSave,
        } = useAlertDetailItem({
            alertId: props.id,
            isEditMode: false,
            dataForUpdate: props.alertData?.project_id,
        });

        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            isModalLoading: true,
            modalVisible: false,
        });

        const openModal = () => {
            state.modalVisible = true;
        };

        const onSelectProject = (selected) => {
            alertDetailItemState.dataForUpdate = selected[0]?.id;
        };

        return {
            EDIT_MODE,
            ...toRefs(alertDetailItemState),
            ...toRefs(state),
            referenceRouter,
            cancelEdit,
            startEdit,
            updateAlert,
            onClickSave,
            onSelectProject,
            openModal,
        };
    },
};
</script>

<style lang="postcss" scoped>
@import './styles/alertDetailItem.pcss';
</style>
