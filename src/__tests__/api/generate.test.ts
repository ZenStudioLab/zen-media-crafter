import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/generate/route';

vi.mock('ai', () => ({
    generateObject: vi.fn().mockRejectedValue(new Error('Incorrect API key')),
}));

describe('POST /api/generate', () => {
    it('returns a 500 error on unexpected errors and logs it', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'test-key',
            },
            body: JSON.stringify({
                prompt: 'test prompt',
                count: 1,
                providerName: 'openai',
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toContain('Incorrect API key');
    });
});
