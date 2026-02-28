import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { DesignJSON, DesignJSONSchema } from '@/core/entities/design-json';

export class OpenAIAdapter implements ILLMProvider {
    private openai;

    constructor(apiKey: string) {
        this.openai = createOpenAI({
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
            model: this.openai('gpt-4o'),
            schema: DesignJSONSchema,
            prompt: messages.map(m => m.content).join('\n'), // simple joining for now
        });

        return object as DesignJSON;
    }
}
