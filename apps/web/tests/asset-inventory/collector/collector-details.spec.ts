import { test, expect } from '@playwright/test';

const collectorId = 'collector-71a970610f7b';
test.describe('Collector Details', () => {

    test('2. Check each areas', async ({ page }) => {
        await page.goto('/asset-inventory/collector/' + collectorId);

        await test.step('2.1. Check Base Information area', async () => {

        })
    })
})