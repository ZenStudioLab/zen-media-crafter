import { describe, it, expect, beforeEach } from 'vitest';
import { StrategyRegistry } from '@/registry/strategy-registry';
import { ILLMProvider } from '@/ports/i-llm-provider';

describe('StrategyRegistry', () => {
    beforeEach(() => {
        StrategyRegistry.getInstance().clear();
    });

    it('is a singleton', () => {
        const instance1 = StrategyRegistry.getInstance();
        const instance2 = StrategyRegistry.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('registers and retrieves an LLM provider', () => {
        const mockProvider: ILLMProvider = {
            generate: async () => ({ version: '1.0', canvas: { width: 100, height: 100 }, elements: [] }),
        };

        const registry = StrategyRegistry.getInstance();
        registry.registerLLMProvider('mock-llm', mockProvider);

        const retrieved = registry.getLLMProvider('mock-llm');
        expect(retrieved).toBe(mockProvider);
    });

    it('throws when retrieving an unregistered provider', () => {
        const registry = StrategyRegistry.getInstance();
        expect(() => registry.getLLMProvider('unknown')).toThrow("LLM Provider 'unknown' not found in registry.");
    });
});
