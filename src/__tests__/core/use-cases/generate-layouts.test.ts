import { describe, it, expect, vi } from 'vitest';
import { GenerateLayouts } from '@/core/use-cases/generate-layouts';
import { Pattern } from '@/core/entities/pattern';
import { UserAsset } from '@/core/entities/user-asset';
import { ILLMProvider } from '@/ports/i-llm-provider';

const mockAsset: UserAsset = {
    id: 'img-001',
    name: 'prod.jpg',
    blobUrl: 'blob:xxx',
    width: 1080,
    height: 1080,
};

const makePattern = (id: string): Pattern => ({
    id,
    name: `Pattern ${id}`,
    description: '',
    tags: [],
    background: { type: 'solid', value: '#000', overlayOpacity: 0.5 },
    textSlots: [{ id: 'headline', zone: 'top', align: 'center', fontFamily: 'Inter', fontSizeScale: 1, color: '#fff', fontWeight: 'bold' }],
    accentColor: '#f00',
    promptHints: 'Make it cool',
});

const mockProvider: ILLMProvider = {
    id: 'mock',
    generateCopyVariations: vi.fn(),
};

describe('GenerateLayouts', () => {
    it('creates one Composition per Pattern', async () => {
        const patterns = [makePattern('dark'), makePattern('light')];
        const result = await GenerateLayouts.execute({
            backgroundImage: mockAsset,
            punchlines: { headline: 'Hello', contentType: 'ad' },
            patterns,
            provider: mockProvider,
            useLLMCopyVariation: false,
        });
        expect(result).toHaveLength(2);
        expect(result[0].name).toContain('dark');
        expect(result[1].name).toContain('light');
    });

    it('does NOT call provider in template mode', async () => {
        const providerSpy = vi.fn();
        await GenerateLayouts.execute({
            backgroundImage: mockAsset,
            punchlines: { headline: 'Hi', contentType: 'meme' },
            patterns: [makePattern('test')],
            provider: { generateCopyVariations: providerSpy, id: 'mock' } as ILLMProvider,
            useLLMCopyVariation: false,
        });
        expect(providerSpy).not.toHaveBeenCalled();
    });

    it('calls provider once per pattern in LLM mode and deep-merges copy by slot ID', async () => {
        // LLM returns only the copy — not the full layout
        const providerSpy = vi.fn().mockResolvedValue({ headline: 'LLM Generated Awesome Headline!' });
        const patterns = [makePattern('a')];

        const result = await GenerateLayouts.execute({
            backgroundImage: mockAsset,
            punchlines: { headline: 'Original Headline', cta: 'Buy', contentType: 'ad' },
            patterns,
            provider: { generateCopyVariations: providerSpy, id: 'mock' } as ILLMProvider,
            useLLMCopyVariation: true,
        });

        expect(providerSpy).toHaveBeenCalledTimes(1);

        // Content updated from LLM variation
        const mergedElement = result[0].designJson.elements.find(e => e.id === 'headline');
        expect(mergedElement?.type).toBe('text');
        if (mergedElement?.type === 'text') {
            expect(mergedElement.content).toBe('LLM Generated Awesome Headline!');
            expect(mergedElement.style.color).toBe('#fff'); // Preserved from pattern slot
            expect(mergedElement.layer).toBe(3); // Preserved
        }
    });

    it('uses original content when LLM returns no matching slot ID', async () => {
        const providerSpy = vi.fn().mockResolvedValue({ nonexistent_slot: 'Ignored' });
        const patterns = [makePattern('a')];

        const result = await GenerateLayouts.execute({
            backgroundImage: mockAsset,
            punchlines: { headline: 'Original', contentType: 'ad' },
            patterns,
            provider: { generateCopyVariations: providerSpy, id: 'mock' } as ILLMProvider,
            useLLMCopyVariation: true,
        });

        const el = result[0].designJson.elements.find(e => e.id === 'headline');
        if (el?.type === 'text') {
            expect(el.content).toBe('Original'); // No override — slot ID didn't match
        }
    });

    it('includes background image on every composition DesignJSON', async () => {
        const result = await GenerateLayouts.execute({
            backgroundImage: { ...mockAsset, id: 'img-001' },
            punchlines: { headline: 'Test', contentType: 'promo' },
            patterns: [makePattern('x')],
            provider: mockProvider,
            useLLMCopyVariation: false,
        });
        expect(result[0].designJson.background.type).toBe('image');
        if (result[0].designJson.background.type === 'image') {
            expect(result[0].designJson.background.assetId).toBe('img-001');
        }
    });

    it('correctly maps center and left alignments/zones', async () => {
        const pattern = makePattern('center-left');
        pattern.textSlots[0].zone = 'center';
        pattern.textSlots[0].align = 'left';

        const result = await GenerateLayouts.execute({
            backgroundImage: mockAsset,
            punchlines: { headline: 'Test', contentType: 'promo' },
            patterns: [pattern],
            provider: mockProvider,
            useLLMCopyVariation: false,
        });
        const el = result[0].designJson.elements[0];
        expect(el.position.y).toBe(480);
        expect(el.position.x).toBe(80);
    });

    it('correctly maps bottom and right alignments/zones', async () => {
        const pattern = makePattern('bottom-right');
        pattern.textSlots[0].zone = 'bottom';
        pattern.textSlots[0].align = 'right';

        const result = await GenerateLayouts.execute({
            backgroundImage: mockAsset,
            punchlines: { headline: 'Test', contentType: 'promo' },
            patterns: [pattern],
            provider: mockProvider,
            useLLMCopyVariation: false,
        });
        const el = result[0].designJson.elements[0];
        expect(el.position.y).toBe(880);
        expect(el.position.x).toBe(900);
    });
});
