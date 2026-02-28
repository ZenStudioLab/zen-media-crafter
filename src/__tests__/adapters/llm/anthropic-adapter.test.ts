import { describe, it, expect, vi } from 'vitest';
import { AnthropicAdapter } from '@/adapters/llm/anthropic-adapter';
import * as aiModule from 'ai';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

describe('AnthropicAdapter', () => {
    it('calls generateObject and returns CopyVariations', async () => {
        const mockVariations = { headline: 'Anthropic Headline', cta: 'Buy Now' };

        // @ts-expect-error Mocking the generateObject function for testing
        aiModule.generateObject.mockResolvedValue({ object: mockVariations });

        const adapter = new AnthropicAdapter('fake-api-key');
        const result = await adapter.generateCopyVariations('test prompt');

        expect(result).toEqual(mockVariations);
        expect(aiModule.generateObject).toHaveBeenCalled();
    });
});
