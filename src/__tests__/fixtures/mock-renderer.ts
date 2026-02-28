import { IRenderingEngine } from '@/ports/i-rendering-engine';
import { vi } from 'vitest';

export class MockRenderer implements IRenderingEngine {
    public render = vi.fn().mockImplementation(async () => {
        return 'http://mock-url.com/render.png';
    });
}
