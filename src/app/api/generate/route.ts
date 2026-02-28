import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateLayouts } from '@/core/use-cases/generate-layouts';
import { OpenAIAdapter } from '@/adapters/llm/openai-adapter';
import { AnthropicAdapter } from '@/adapters/llm/anthropic-adapter';
import { GeminiAdapter } from '@/adapters/llm/gemini-adapter';
import { PunchlineSetSchema } from '@/core/entities/punchline-set';
import { PatternSchema } from '@/core/entities/pattern';
import { UserAssetSchema } from '@/core/entities/user-asset';
import { ILLMProvider } from '@/ports/i-llm-provider';

// Payload Validation Schema
const GeneratePayloadSchema = z.object({
    backgroundImage: UserAssetSchema,
    punchlines: PunchlineSetSchema,
    patterns: z.array(PatternSchema).min(1),
    providerName: z.enum(['openai', 'anthropic', 'gemini']).optional(),
    useLLMCopyVariation: z.boolean().default(false),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = GeneratePayloadSchema.parse(body);

        let providerAdapter: ILLMProvider | null = null;

        // Only instantiate adapter and check API key if we actually need LLM variation
        if (payload.useLLMCopyVariation && payload.providerName) {
            const apiKey = request.headers.get('x-api-key');
            if (!apiKey) {
                return NextResponse.json({ error: 'API Key is required in x-api-key header for LLM variation mode' }, { status: 401 });
            }

            switch (payload.providerName) {
                case 'openai':
                    providerAdapter = new OpenAIAdapter(apiKey);
                    break;
                case 'anthropic':
                    providerAdapter = new AnthropicAdapter(apiKey);
                    break;
                case 'gemini':
                    providerAdapter = new GeminiAdapter(apiKey);
                    break;
                default:
                    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
            }
        }

        const compositions = await GenerateLayouts.execute({
            backgroundImage: payload.backgroundImage,
            punchlines: payload.punchlines,
            patterns: payload.patterns,
            provider: providerAdapter || { id: 'none', generateCopyVariations: async () => ({}) },
            useLLMCopyVariation: payload.useLLMCopyVariation,
        });

        console.log("Compositions generated successfully", compositions.length);
        return NextResponse.json({ compositions });
    } catch (error: unknown) {
        console.log("Caught Error in POST:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, { status: 400 });
        }

        console.error('API /generate error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during generation';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
