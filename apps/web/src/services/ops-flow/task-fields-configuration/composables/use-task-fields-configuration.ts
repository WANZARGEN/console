import type { TaskField, TaskFieldSelectionType, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import getRandomId from '@/lib/random-id-generator';

import { useFieldValidator } from '@/common/composables/form-validator';

import type {
    TaskFieldTypeMetadata,
} from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

const DEFAULT_SELECTION_TYPE_MAP: Record<TaskFieldType, TaskFieldSelectionType|undefined> = {
    GLOBAL: undefined,
    TEXT: undefined,
    PARAGRAPH: undefined,
    LABELS: 'MULTI',
    DROPDOWN: 'MULTI',
    DATE: undefined,
    USER: 'MULTI',
    ASSET: 'MULTI',
    PROJECT: 'MULTI',
    PROVIDER: 'MULTI',
    SERVICE_ACCOUNT: 'MULTI',
};
export const useTaskFieldsConfiguration = () => {
    const validationMap = new Map<string, boolean>();

    const taskFieldsValidator = useFieldValidator<TaskField[]>([], (_fields) => _fields.every((field) => validationMap.get(field.field_id)));
    const {
        value: fields,
        setValue: setFields,
        validate: validateFields,
    } = taskFieldsValidator;

    return {
        taskFieldsValidator,
        fields,
        setFields,
        addField(field: TaskFieldTypeMetadata) {
            const fieldId = getRandomId();
            validationMap.set(fieldId, false);
            setFields([...fields.value, {
                field_id: fieldId,
                field_type: field.type,
                name: field.name,
                is_required: false,
                selection_type: DEFAULT_SELECTION_TYPE_MAP[field.type],
                is_primary: false,
                options: {},
            } as TaskField]);
        },
        removeField(fieldId: string) {
            validationMap.delete(fieldId);
            setFields(fields.value.filter((field) => field.field_id !== fieldId));
        },
        updateFieldValidation(fieldId: string, isValid: boolean) {
            validationMap.set(fieldId, isValid);
            // manually trigger validation to update invalid state
            validateFields();
        },
        setInitialFields(initialFields?: TaskField[]) {
            validationMap.clear();
            initialFields?.forEach((field) => {
                validationMap.set(field.field_id, true);
            });
            setFields(initialFields ?? []);
        },
    };
};
