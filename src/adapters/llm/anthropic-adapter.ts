import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { DesignJSON, DesignJSONSchema } from '@/core/entities/design-json';

export class AnthropicAdapter implements ILLMProvider {
    private anthropic;

    constructor(apiKey: string) {
        this.anthropic = createAnthropic({
            apiKey,
        });
    }

    public async generate(prompt: string, baseDesign?: DesignJSON): Promise<DesignJSON> {
        const systemPrompt = `You are an expert graphic designer. You must output a JSON layout composition based on the user's prompt.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ];

        if (baseDesign) {
            messages.push({
                role: 'user',
                content: `Base Design: ${JSON.stringify(baseDesign)}`
            });
        }

        const { object } = await generateObject({
            model: this.anthropic('claude-3-7-sonnet-20250219'),
            schema: DesignJSONSchema,
            prompt: messages.map(m => m.content).join('\n'),
        });

        return object as DesignJSON;
    }
}
