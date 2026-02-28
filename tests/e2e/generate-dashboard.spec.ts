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
                        design: {
                            version: '1.0',
                            canvas: { width: 1080, height: 1080 },
                            elements: [
                                {
                                    id: 'text-1',
                                    type: 'text',
                                    content: 'MOCK GENERATED TEXT',
                                    style: {
                                        x: 200,
                                        y: 200,
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

    test('successfully generates a layout and displays it in the gallery', async ({ page }) => {
        // 1. Navigate to the generate page
        await page.goto('/generate');

        // 2. Set API key in the UI config
        // Click the API config button (aria-label "settings")
        await page.getByRole('button', { name: 'settings' }).click();

        // Fill the OpenAI key input
        // Since Material UI might transform labels or it's just 'OpenAI API Key', we will match by exact placeholder bounds or just generic 'API Key' label
        await page.getByLabel(/OpenAI API Key/i).fill('mock-e2e-api-key-123');

        // Close the dialog
        await page.getByRole('button', { name: /save keys/i }).click();

        // 3. Interact with the Dashboard controls
        const promptInput = page.getByLabel(/prompt/i);
        await promptInput.fill('A cool promo for my startup');

        const generateBtn = page.getByRole('button', { name: /generate layouts/i });
        await generateBtn.click();

        // 4. Verify Gallery renders the MockRenderer response
        const mockTextElement = page.getByText('MOCK GENERATED TEXT');
        await expect(mockTextElement).toBeVisible();

        // Verify variant title exists
        await expect(page.getByText('Variant 1')).toBeVisible();
    });
});
