import { describe, it, expect, vi } from 'vitest';
import { GeminiAdapter } from '@/adapters/llm/gemini-adapter';
import * as aiModule from 'ai';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

describe('GeminiAdapter', () => {
    it('calls generateObject and returns CopyVariations', async () => {
        const mockVariations = { headline: 'Gemini Flash Deal', subheadline: 'Limited Time Only' };

        // @ts-expect-error Mocking the generateObject function for testing
        aiModule.generateObject.mockResolvedValue({ object: mockVariations });

        const adapter = new GeminiAdapter('fake-api-key');
        const result = await adapter.generateCopyVariations('test prompt');

        expect(result).toEqual(mockVariations);
        expect(aiModule.generateObject).toHaveBeenCalled();
    });
});
