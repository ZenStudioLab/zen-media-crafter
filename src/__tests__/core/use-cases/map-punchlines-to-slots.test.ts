import { describe, it, expect } from 'vitest';
import { mapPunchlinesToSlots } from '../../../core/use-cases/map-punchlines-to-slots';
import { Pattern } from '../../../core/entities/pattern';

const adPattern: Pattern = {
    id: 'test',
    name: 'Test',
    description: '',
    tags: [],
    accentColor: '#fff',
    background: { type: 'solid', value: '#000', overlayOpacity: 0.5 },
    textSlots: [
        { id: 'headline', zone: 'top', align: 'left', fontFamily: 'Inter', fontSizeScale: 1.5, color: '#fff', fontWeight: 'extrabold' },
        { id: 'subheadline', zone: 'center', align: 'left', fontFamily: 'Inter', fontSizeScale: 1.0, color: '#ccc', fontWeight: 'normal' },
        { id: 'cta', zone: 'bottom', align: 'right', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#0f0', fontWeight: 'bold' },
    ],
};

describe('mapPunchlinesToSlots()', () => {
    it('maps headline and CTA correctly', () => {
        const result = mapPunchlinesToSlots(
            { headline: '50% Off', cta: 'Shop Now', contentType: 'ad' },
            adPattern
        );
        expect(result.find(r => r.slotId === 'headline')?.text).toBe('50% Off');
        expect(result.find(r => r.slotId === 'cta')?.text).toBe('Shop Now');
    });

    it('skips slots whose punchline was not provided', () => {
        const result = mapPunchlinesToSlots(
            { headline: 'Hello', contentType: 'ad' }, // no subheadline
            adPattern
        );
        expect(result.find(r => r.slotId === 'subheadline')).toBeUndefined();
    });

    it('ignores slots not relevant to contentType meme', () => {
        // meme only shows headline + caption, never cta
        const result = mapPunchlinesToSlots(
            { headline: 'Top text', caption: 'Bottom text', contentType: 'meme' },
            adPattern
        );
        expect(result.find(r => r.slotId === 'cta')).toBeUndefined();
    });
});
