import { z } from 'zod';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ILLMProvider, CopyVariations } from '@/ports/i-llm-provider';
import { UserAsset } from '@/core/entities/user-asset';

const CopyVariationsSchema = z.object({
    headline: z.string().optional().describe('Improved headline copy'),
    subheadline: z.string().optional().describe('Improved sub-headline copy'),
    cta: z.string().optional().describe('Improved call-to-action copy'),
    caption: z.string().optional().describe('Improved caption copy'),
});

export class GeminiAdapter implements ILLMProvider {
    public readonly id = 'gemini';
    private google;

    constructor(apiKey: string) {
        this.google = createGoogleGenerativeAI({ apiKey });
    }

    public async generateCopyVariations(prompt: string, assets?: UserAsset[]): Promise<CopyVariations> {
        const assetContext = assets?.length
            ? `\n\nBackground Asset ID for reference: ${assets[0].id}`
            : '';

        const { object } = await generateObject({
            model: this.google('gemini-2.5-flash'),
            schema: CopyVariationsSchema,
            prompt: `${prompt}${assetContext}`,
        });

        return Object.fromEntries(
            Object.entries(object).filter(([, v]) => v !== undefined)
        ) as CopyVariations;
    }
}
