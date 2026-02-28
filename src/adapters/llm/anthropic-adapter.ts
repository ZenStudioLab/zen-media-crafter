import { z } from 'zod';
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ILLMProvider, CopyVariations } from '@/ports/i-llm-provider';
import { UserAsset } from '@/core/entities/user-asset';

const CopyVariationsSchema = z.object({
    headline: z.string().optional().describe('Improved headline copy'),
    subheadline: z.string().optional().describe('Improved sub-headline copy'),
    cta: z.string().optional().describe('Improved call-to-action copy'),
    caption: z.string().optional().describe('Improved caption copy'),
});

export class AnthropicAdapter implements ILLMProvider {
    public readonly id = 'anthropic';
    private anthropic;

    constructor(apiKey: string) {
        this.anthropic = createAnthropic({ apiKey });
    }

    public async generateCopyVariations(prompt: string, assets?: UserAsset[]): Promise<CopyVariations> {
        const assetContext = assets?.length
            ? `\n\nBackground Asset ID for reference: ${assets[0].id}`
            : '';

        const { object } = await generateObject({
            model: this.anthropic('claude-3-7-sonnet-20250219'),
            schema: CopyVariationsSchema,
            prompt: `${prompt}${assetContext}`,
        });

        return Object.fromEntries(
            Object.entries(object).filter(([, v]) => v !== undefined)
        ) as CopyVariations;
    }
}
