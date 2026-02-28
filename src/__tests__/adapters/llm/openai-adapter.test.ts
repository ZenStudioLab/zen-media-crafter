import { describe, it, expect, vi } from 'vitest';
import { OpenAIAdapter } from '@/adapters/llm/openai-adapter';
import * as aiModule from 'ai';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

describe('OpenAIAdapter', () => {
    it('calls generateObject with the exact schema and returns DesignJSON', async () => {
        const mockDesign = {
            version: '1.0',
            canvas: { width: 1080, height: 1080 },
            elements: [],
        };

        // @ts-ignore
        aiModule.generateObject.mockResolvedValue({ object: mockDesign });

        const adapter = new OpenAIAdapter('fake-api-key');
        const result = await adapter.generate('test prompt');

        expect(result).toEqual(mockDesign);
        expect(aiModule.generateObject).toHaveBeenCalled();
    });
});
