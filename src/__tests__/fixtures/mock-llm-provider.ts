import { ILLMProvider, CopyVariations } from '@/ports/i-llm-provider';
import { vi } from 'vitest';

export class MockLLMProvider implements ILLMProvider {
    public id = 'mock-provider';

    public generateCopyVariations = vi.fn().mockResolvedValue({
        headline: 'Mock AI Headline',
        cta: 'Shop Now',
    } as CopyVariations);
}
