import { defineStore } from 'pinia';

import type { CollectorModel, SecretModel } from '@/services/asset-inventory/collector/model';

export const useCollectorDataModalStore = defineStore('collector-data-modal', {
    state: () => ({
        selectedCollector: {} as CollectorModel, // This state is used for API.
        selectedSecret: {} as SecretModel, // In detail page, This state is used for API.
        secrets: [] as SecretModel[], // In detail page, This state is used for account count.
    }),
});
