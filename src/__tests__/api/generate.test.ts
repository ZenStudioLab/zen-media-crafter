import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/generate/route';

// Mock the 'ai' module to return simple CopyVariations — not a full DesignJSON
vi.mock('ai', () => ({
    generateObject: vi.fn().mockRejectedValue(new Error('Incorrect API key')),
}));

const basePayload = {
    backgroundImage: { id: 'img-1', name: 'Img', blobUrl: 'url', width: 100, height: 100 },
    punchlines: { headline: 'Test', contentType: 'ad' },
    patterns: [
        {
            id: 'p1', name: 'P1', description: '', promptHints: 'test', tags: [],
            background: { type: 'solid', value: '#000', overlayOpacity: 0 },
            accentColor: '#fff', textSlots: []
        }
    ],
};

describe('POST /api/generate', () => {
    it('returns 200 with compositions in template mode (no LLM)', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...basePayload, useLLMCopyVariation: false }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.compositions).toHaveLength(1);
    });

    it('returns a 401 error if API key is missing when useLLMCopyVariation is true', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...basePayload, providerName: 'openai', useLLMCopyVariation: true }),
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('returns a 400 Zod validation error for an invalid provider name', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'test' },
            body: JSON.stringify({ ...basePayload, providerName: 'unsupported_provider', useLLMCopyVariation: true }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('returns a 400 error on completely missing required fields', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Validation failed');
    });

    it('returns a 500 error when the LLM adapter throws (mocked AI module error)', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'test-key' },
            body: JSON.stringify({ ...basePayload, providerName: 'openai', useLLMCopyVariation: true }),
        });

        const res = await POST(req);
        const data = await res.json();
        expect(res.status).toBe(500);
        expect(data.error).toContain('Incorrect API key');
    });

    it('instantiates Anthropic adapter and returns 500 when LLM rejects', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'test' },
            body: JSON.stringify({ ...basePayload, providerName: 'anthropic', useLLMCopyVariation: true }),
        });
        const res = await POST(req);
        expect(res.status).toBe(500);
    });

    it('instantiates Gemini adapter and returns 500 when LLM rejects', async () => {
        const req = new Request('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'test' },
            body: JSON.stringify({ ...basePayload, providerName: 'gemini', useLLMCopyVariation: true }),
        });
        const res = await POST(req);
        expect(res.status).toBe(500);
    });
});
