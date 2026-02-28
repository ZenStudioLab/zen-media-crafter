import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { ILLMProvider, CopyVariations } from '@/ports/i-llm-provider';
import { UserAsset } from '@/core/entities/user-asset';

// A simple schema: the LLM only needs to return a flat {slotId: text} map.
// Much simpler than DesignJSON — no discriminated unions, no nested objects.
const CopyVariationsSchema = z.object({
    headline: z.string().optional().describe('Improved headline copy'),
    subheadline: z.string().optional().describe('Improved sub-headline copy'),
    cta: z.string().optional().describe('Improved call-to-action copy'),
    caption: z.string().optional().describe('Improved caption copy'),
});

export class OpenAIAdapter implements ILLMProvider {
    public readonly id = 'openai';
    private openai;

    constructor(apiKey: string) {
        this.openai = createOpenAI({ apiKey });
    }

    public async generateCopyVariations(prompt: string, assets?: UserAsset[]): Promise<CopyVariations> {
        const assetContext = assets?.length
            ? `\n\nBackground Asset ID for reference: ${assets[0].id}`
            : '';

        const { object } = await generateObject({
            model: this.openai('gpt-4o'),
            schema: CopyVariationsSchema,
            prompt: `${prompt}${assetContext}`,
        });

        // Filter undefined values before returning
        return Object.fromEntries(
            Object.entries(object).filter(([, v]) => v !== undefined)
        ) as CopyVariations;
    }
}
