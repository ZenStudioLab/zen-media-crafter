import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateLayouts } from '@/core/use-cases/generate-layouts';
import { Project } from '@/core/entities/project';
import { StrategyRegistry } from '@/registry/strategy-registry';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { DesignJSON } from '@/core/entities/design-json';

describe('GenerateLayouts Use Case', () => {
    let project: Project;
    let mockProvider: ILLMProvider;

    beforeEach(() => {
        project = new Project('Ad Campaign');

        mockProvider = {
            generate: vi.fn().mockResolvedValue({
                version: '1.0',
                canvas: { width: 1080, height: 1080 },
                elements: []
            } as DesignJSON),
        };

        StrategyRegistry.getInstance().clear();
        StrategyRegistry.getInstance().registerLLMProvider('test-provider', mockProvider);
    });

    it('generates N compositions and adds them to the project', async () => {
        await GenerateLayouts.execute(project, 'A cool ad', 3, 'test-provider');

        expect(project.compositions.length).toBe(3);
        expect(mockProvider.generate).toHaveBeenCalledTimes(3);
        expect(mockProvider.generate).toHaveBeenCalledWith('A cool ad');

        expect(project.compositions[0].name).toBe('Variant 1');
        expect(project.compositions[0].generatedBy).toBe('test-provider');
        expect(project.compositions[2].name).toBe('Variant 3');
    });

    it('throws an error if the provider is not registered', async () => {
        await expect(GenerateLayouts.execute(project, 'A cool ad', 1, 'unknown-provider'))
            .rejects
            .toThrow("LLM Provider 'unknown-provider' not found in registry.");
    });
});
