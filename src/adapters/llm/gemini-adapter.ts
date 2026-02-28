import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { DesignJSON, DesignJSONSchema } from '@/core/entities/design-json';

export class GeminiAdapter implements ILLMProvider {
    private google;

    constructor(apiKey: string) {
        this.google = createGoogleGenerativeAI({
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
            model: this.google('gemini-2.5-flash'),
            schema: DesignJSONSchema,
            prompt: messages.map(m => m.content).join('\n'),
        });

        return object as DesignJSON;
    }
}
