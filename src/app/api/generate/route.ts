import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GenerateLayouts } from '@/core/use-cases/generate-layouts';
import { OpenAIAdapter } from '@/adapters/llm/openai-adapter';
import { AnthropicAdapter } from '@/adapters/llm/anthropic-adapter';
import { GeminiAdapter } from '@/adapters/llm/gemini-adapter';

// Payload Validation Schema
const GeneratePayloadSchema = z.object({
    prompt: z.string().min(3, "Prompt must be at least 3 characters long"),
    count: z.number().int().min(1).max(10),
    providerName: z.enum(['openai', 'anthropic', 'gemini']),
    startIndex: z.number().int().min(0).optional().default(0),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = GeneratePayloadSchema.parse(body);

        const apiKey = request.headers.get('x-api-key');
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is required in x-api-key header' }, { status: 401 });
        }

        // Instantiate the specific adapter locally for this stateless request
        let providerAdapter;
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

        const compositions = await GenerateLayouts.execute(
            payload.prompt,
            payload.count,
            providerAdapter,
            payload.providerName,
            payload.startIndex
        );

        return NextResponse.json({ compositions });

    } catch (error: any) {
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
