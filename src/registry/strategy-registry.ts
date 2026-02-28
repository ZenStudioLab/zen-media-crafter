import { ILLMProvider } from '@/ports/i-llm-provider';

export class StrategyRegistry {
    private static instance: StrategyRegistry;
    private llmProviders: Map<string, ILLMProvider> = new Map();

    private constructor() { }

    public static getInstance(): StrategyRegistry {
        if (!StrategyRegistry.instance) {
            StrategyRegistry.instance = new StrategyRegistry();
        }
        return StrategyRegistry.instance;
    }

    public registerLLMProvider(name: string, provider: ILLMProvider): void {
        this.llmProviders.set(name, provider);
    }

    public getLLMProvider(name: string): ILLMProvider {
        const provider = this.llmProviders.get(name);
        if (!provider) {
            throw new Error(`LLM Provider '${name}' not found in registry.`);
        }
        return provider;
    }

    public clear(): void {
        this.llmProviders.clear();
    }
}
