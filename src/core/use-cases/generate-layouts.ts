import { Composition } from '@/core/entities/composition';
import { ILLMProvider } from '@/ports/i-llm-provider';

export class GenerateLayouts {
    /**
     * Generates N new layout compositions.
     * @param prompt The prompt to generate from.
     * @param count The number of variants to generate.
     * @param provider The ILLMProvider instance to use.
     * @param providerName The name of the LLM provider (e.g., 'openai').
     * @param startIndex The starting index for variant naming.
     * @returns A Promise resolving to an array of new Compositions.
     */
    public static async execute(
        prompt: string,
        count: number,
        provider: ILLMProvider,
        providerName: string,
        startIndex: number = 0
    ): Promise<Composition[]> {
        const promises = Array.from({ length: count }).map(() => provider.generate(prompt));
        const designs = await Promise.all(promises);

        return designs.map((design, index) => {
            const compositionName = `Variant ${startIndex + index + 1}`;
            return new Composition(compositionName, design, providerName);
        });
    }
}
