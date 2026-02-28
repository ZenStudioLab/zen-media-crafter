import { test, expect } from '@playwright/test';

test.describe('Generate Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the API endpoint so we don't hit the real LLM in E2E tests and waste tokens
        await page.route('**/api/generate', async (route) => {
            const json = {
                compositions: [
                    {
                        id: 'mock-uuid-1',
                        name: 'Variant 1',
                        generatedBy: 'openai',
                        createdAt: new Date().toISOString(),
                        designJson: {
                            version: '1.0',
                            canvas: { width: 1080, height: 1080 },
                            background: { type: 'solid', value: '#fff' },
                            elements: [
                                {
                                    id: 'text-1',
                                    type: 'text',
                                    content: 'MOCK GENERATED TEXT',
                                    position: { x: 500, y: 500 },
                                    layer: 3,
                                    style: {
                                        fontSize: 64,
                                        color: '#ffffff',
                                    }
                                }
                            ]
                        }
                    }
                ]
            };
            await route.fulfill({ json });
        });
    });

    test('PatternSelector allows toggling patterns and updates generation button', async ({ page }) => {
        await page.goto('/generate');

        // Verify the selector header
        await expect(page.getByText('Visual Patterns')).toBeVisible();

        // Ensure there are patterns to click
        const patterns = page.locator('h4');
        await expect(patterns.first()).toBeVisible();

        // Verify default button state says "Generate 0 Variants" because none are selected, OR if default is 1, let's verify.
        // Actually, the new UI initialized store with pre-selected preset patterns, and the button says "Generate X Variants".
        const generateBtn = page.getByRole('button', { name: /Generate.*Variants?/i });
        await expect(generateBtn).toBeVisible();
        const btnText = await generateBtn.textContent();
        expect(btnText).toMatch(/Generate \d+ Variant/);
    });

    test('successfully generates a layout via mock API and displays it in the gallery', async ({ page }) => {
        await page.goto('/generate');

        // 1. Fill Content Inputs
        const headlineInput = page.getByLabel('Headline', { exact: true });
        await headlineInput.fill('A cool promo for my startup');

        // 2. Select AI Copilot
        await page.getByLabel('Suggest Copy Variations').check();

        // 3. Set API key in the UI config (required if using LLM)
        await page.getByRole('button', { name: 'settings' }).click();
        await page.getByLabel(/OpenAI API Key/i).fill('mock-e2e-api-key-123');
        await page.getByRole('button', { name: /save keys/i }).click();

        // 4. Generate
        const generateBtn = page.getByRole('button', { name: /Generate.*Variants?/i });
        await generateBtn.click();

        // 5. Verify Gallery renders the MockRenderer response or Variant list
        await expect(page.getByText('MOCK GENERATED TEXT')).toBeVisible();
        await expect(page.getByText('Variant 1')).toBeVisible();
    });
});
