import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateLayouts } from '@/core/use-cases/generate-layouts';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { DesignJSON } from '@/core/entities/design-json';

describe('GenerateLayouts Use Case', () => {
    let mockProvider: ILLMProvider;

    beforeEach(() => {
        mockProvider = {
            generate: vi.fn().mockResolvedValue({
                version: '1.0',
                canvas: { width: 1080, height: 1080 },
                elements: []
            } as DesignJSON),
        };
    });

    it('generates N compositions and returns them', async () => {
        const compositions = await GenerateLayouts.execute('A cool ad', 3, mockProvider, 'test-provider', 0);

        expect(compositions.length).toBe(3);
        expect(mockProvider.generate).toHaveBeenCalledTimes(3);
        expect(mockProvider.generate).toHaveBeenCalledWith('A cool ad');

        expect(compositions[0].name).toBe('Variant 1');
        expect(compositions[0].generatedBy).toBe('test-provider');
        expect(compositions[2].name).toBe('Variant 3');
    });
});
