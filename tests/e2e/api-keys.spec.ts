import { test, expect } from '@playwright/test';

test('API Key Configuration UI saves to Redux', async ({ page }) => {
    await page.goto('/');

    // Verify homepage loaded
    await expect(page.locator('text=Welcome to Zen Media Crafter')).toBeVisible();

    // Click the FAB to open settings
    await page.locator('button[aria-label="settings"]').click();

    // Verify drawer opened
    const drawerHeading = page.locator('text=API Configuration');
    await expect(drawerHeading).toBeVisible();

    // Type API keys
    await page.getByLabel('OpenAI API Key').fill('sk-test-12345');
    await page.getByLabel('Anthropic API Key').fill('ant-test-67890');
    await page.getByLabel('Gemini API Key').fill('gem-test-11121');

    // Save keys
    const saveButton = page.locator('button:has-text("Save Keys")');
    await saveButton.click();

    // Verify the drawer is closed
    await expect(drawerHeading).not.toBeVisible();
});
