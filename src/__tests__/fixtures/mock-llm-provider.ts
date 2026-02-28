import { ILLMProvider } from '@/ports/i-llm-provider';
import { DesignJSON } from '@/core/entities/design-json';
import { vi } from 'vitest';

export class MockLLMProvider implements ILLMProvider {
    public generate = vi.fn().mockResolvedValue({
        version: '1.0',
        canvas: { width: 1920, height: 1080 },
        elements: [],
    } as DesignJSON);
}
