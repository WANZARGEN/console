import { reactive, computed, watch } from 'vue';

import { isEmpty, isEqual } from 'lodash';
import { defineStore } from 'pinia';

import type { FileModel } from '@/schema/file-manager/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';
import type { TaskModel } from '@/schema/opsflow/task/model';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskAssignStore } from '@/services/ops-flow/stores/task-assign-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskFieldMetadataStore,
} from '@/services/ops-flow/task-fields-configuration/stores/use-task-field-metadata-store';
import type { DefaultTaskFieldId } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

interface UseTaskContentFormStoreState {
    originTask?: TaskModel;
    // base form
    currentCategoryId?: string;
    currentTaskType?: TaskTypeModel;
    statusId?: string;
    assignee?: string;
    isBaseFormValid: boolean;
    // default field form
    defaultData: Partial<Record<DefaultTaskFieldId, any>>;
    defaultDataValidationMap: Record<string, boolean>;
    // task type field form
    data: Record<string, any>;
    dataValidationMap: Record<string, boolean>;
    files: FileModel[];
    // overall
    mode: 'create'|'view';
    hasUnsavedChanges: boolean;
    createTaskLoading: boolean;
}
interface UseTaskContentFormStoreGetters {
    currentCategory: TaskCategoryModel|undefined;
    currentFields: TaskField[];
    isDefaultFieldValid: boolean;
    isFieldValid: boolean;
    isAllValid: boolean;
}
export const useTaskContentFormStore = defineStore('task-content-form', () => {
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();
    const taskStore = useTaskStore();
    const taskFieldMetadataStore = useTaskFieldMetadataStore();
    const taskAssignStore = useTaskAssignStore();

    const state = reactive<UseTaskContentFormStoreState>({
        originTask: undefined,
        // base form
        currentCategoryId: undefined,
        currentTaskType: undefined,
        statusId: undefined,
        assignee: undefined,
        isBaseFormValid: false,
        // default field form
        defaultData: {},
        defaultDataValidationMap: {},
        // task type field form
        data: {},
        dataValidationMap: {},
        files: [],
        // overall
        mode: 'create',
        hasUnsavedChanges: false,
        createTaskLoading: false,
    });
    const getters = {
        // base form
        currentCategory: computed<TaskCategoryModel|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.currentCategoryId)),
        // task type field form
        currentFields: computed<TaskField[]>(() => {
            const taskType = state.currentTaskType;
            return taskType ? taskType.fields : [];
        }),
        isDefaultFieldValid: computed<boolean>(() => taskFieldMetadataStore.getters.defaultFields.every((field) => state.defaultDataValidationMap[field.field_id])),
        isFieldValid: computed<boolean>(() => getters.currentFields?.every((field) => state.dataValidationMap[field.field_id]) ?? true),
        // overall
        isAllValid: computed<boolean>(() => state.isBaseFormValid && getters.isDefaultFieldValid && getters.isFieldValid),
    } as unknown as UseTaskContentFormStoreGetters; // HACK: to avoid type error
    const actions = {
        async setCurrentCategoryId(categoryId?: string) {
            if (state.currentCategoryId === categoryId) return;
            state.currentCategoryId = categoryId;
            state.currentTaskType = undefined;
        },
        async setCurrentTaskType(taskTypeId?: string) {
            if (state.currentTaskType?.task_type_id === taskTypeId) return;
            if (taskTypeId) {
                if (taskTypeStore.state.fullFieldsItemMap[taskTypeId]) {
                    state.currentTaskType = taskTypeStore.state.fullFieldsItemMap[taskTypeId];
                } else {
                    state.currentTaskType = await taskTypeStore.getWithFullFields(taskTypeId);
                }
            } else {
                state.currentTaskType = undefined;
            }
            state.data = {};
            state.dataValidationMap = {};
            state.files = [];
        },
        setStatusId(statusId?: string) {
            state.statusId = statusId;
        },
        setAssignee(assignee?: string) {
            state.assignee = assignee;
        },
        setIsBaseFormValid(isValid: boolean) {
            state.isBaseFormValid = isValid;
        },
        openAssignModal() {
            if (!state.currentTaskType) {
                ErrorHandler.handleError(new Error('Task type is not selected'));
                return;
            }
            if (!state.originTask) {
                ErrorHandler.handleError(new Error('Origin task is not defined'));
                return;
            }
            taskAssignStore.openAssignModal(state.originTask.task_id, state.originTask.assignee, state.currentTaskType.assignee_pool);
        },
        // default field form
        setDefaultFieldData(fieldId: DefaultTaskFieldId, value: any) {
            state.hasUnsavedChanges = state.defaultData[fieldId] !== value;
            state.defaultData[fieldId] = value;
        },
        setDefaultFieldValidation(fieldId: DefaultTaskFieldId, isValid: boolean) {
            state.defaultDataValidationMap = { ...state.defaultDataValidationMap, [fieldId]: isValid };
        },
        // task type field form
        setFieldData(fieldId: string, value: any) {
            state.hasUnsavedChanges = state.data[fieldId] !== value;
            state.data[fieldId] = value;
        },
        setFieldValidation(fieldId: string, isValid: boolean) {
            state.dataValidationMap = { ...state.dataValidationMap, [fieldId]: isValid };
        },
        setFiles(files: FileModel[]) {
            state.hasUnsavedChanges = !isEqual(state.files, files);
            state.files = files;
        },
        // overall
        setCurrentTask(task: TaskModel) {
            state.originTask = task;
            state.currentCategoryId = task.category_id;
            actions.setCurrentTaskType(task.task_type_id);
            state.statusId = task.status_id;
            state.assignee = task.assignee;
            state.defaultData = {
                title: task.name,
                description: task.description,
                project: task.project_id ? [task.project_id] : undefined,
            };
            state.data = task.data ?? {};
            state.defaultDataValidationMap = {};
            state.dataValidationMap = {};
        },
        resetFieldsForm() {
            state.defaultData = {};
            state.defaultDataValidationMap = {};
            state.data = {};
            state.dataValidationMap = {};
            state.files = [];
        },
        setMode(mode: 'create'|'view') {
            state.mode = mode;
        },
        async createTask() {
            try {
                if (!state.currentTaskType) throw new Error('Task type is not selected');
                state.createTaskLoading = true;
                state.originTask = await taskStore.create({
                    task_type_id: state.currentTaskType.task_type_id,
                    name: state.defaultData.title,
                    status_id: state.statusId as string,
                    description: state.defaultData.description || undefined,
                    assignee: state.assignee || undefined,
                    data: isEmpty(state.data) ? undefined : state.data,
                    files: state.files.map((f) => f.file_id),
                    project_id: state.defaultData.project?.[0],
                });
                showSuccessMessage('Task created successfully', '');
                state.createTaskLoading = false;
                return true;
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to create task');
                state.createTaskLoading = false;
                return false;
            }
        },
    };

    // watch assignee change
    watch([() => taskAssignStore.state.currentAssignee, () => taskAssignStore.state.visibleAssignModal], ([user, visible]) => {
        if (!state.originTask) return;
        if (!visible && user && user !== state.originTask.assignee) {
            state.originTask.assignee = user;
        }
    }, { immediate: true });

    return {
        state,
        getters,
        ...actions,
    };
});
