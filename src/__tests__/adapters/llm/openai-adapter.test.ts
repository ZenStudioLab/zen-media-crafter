import { describe, it, expect, vi } from 'vitest';
import { OpenAIAdapter } from '@/adapters/llm/openai-adapter';
import * as aiModule from 'ai';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

describe('OpenAIAdapter', () => {
    it('calls generateObject and returns CopyVariations', async () => {
        const mockVariations = { headline: 'Fire Summer Sale', cta: 'Shop Now' };

        // @ts-expect-error Mocking the generateObject function for testing
        aiModule.generateObject.mockResolvedValue({ object: mockVariations });

        const adapter = new OpenAIAdapter('fake-api-key');
        const result = await adapter.generateCopyVariations('test prompt');

        expect(result).toEqual(mockVariations);
        expect(aiModule.generateObject).toHaveBeenCalled();
    });
});
