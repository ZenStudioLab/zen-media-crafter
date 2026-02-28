import { Project } from '@/core/entities/project';
import { Composition } from '@/core/entities/composition';
import { StrategyRegistry } from '@/registry/strategy-registry';

export class GenerateLayouts {
    /**
     * Generates N new layout compositions for a project.
     * @param project The project to add compositions to.
     * @param prompt The prompt to generate from.
     * @param count The number of variants to generate.
     * @param providerName The name of the registered LLM provider (e.g., 'openai').
     */
    public static async execute(
        project: Project,
        prompt: string,
        count: number,
        providerName: string
    ): Promise<void> {
        const registry = StrategyRegistry.getInstance();
        const provider = registry.getLLMProvider(providerName);

        const promises = Array.from({ length: count }).map(() => provider.generate(prompt));
        const designs = await Promise.all(promises);

        designs.forEach((design) => {
            const compositionName = `Variant ${project.compositions.length + 1}`;
            const composition = new Composition(compositionName, design, providerName);
            project.addComposition(composition);
        });
    }
}
