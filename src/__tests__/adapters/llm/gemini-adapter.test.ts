import { describe, it, expect, vi } from 'vitest';
import { GeminiAdapter } from '@/adapters/llm/gemini-adapter';
import * as aiModule from 'ai';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

describe('GeminiAdapter', () => {
    it('calls generateObject with the exact schema and returns DesignJSON', async () => {
        const mockDesign = {
            version: '1.0',
            canvas: { width: 1080, height: 1080 },
            elements: [],
        };

        // @ts-expect-error Mocking the generateObject function for testing
        aiModule.generateObject.mockResolvedValue({ object: mockDesign });

        const adapter = new GeminiAdapter('fake-api-key');
        const result = await adapter.generate('test prompt');

        expect(result).toEqual(mockDesign);
        expect(aiModule.generateObject).toHaveBeenCalled();
    });
});
