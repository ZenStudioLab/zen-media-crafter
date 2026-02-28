import { describe, it, expect } from 'vitest';
import { PatternSchema } from '../../../core/entities/pattern';

describe('Pattern Entity', () => {
    it('validates a full valid pattern', () => {
        const valid = {
            id: 'neon-noir',
            name: 'Neon Noir',
            description: 'Dark cyberpunk style',
            tags: ['dark', 'gaming'],
            background: { type: 'solid', value: '#0d1117', overlayOpacity: 0.7 },
            textSlots: [
                {
                    id: 'headline', zone: 'bottom', align: 'left', fontFamily: 'Inter',
                    fontSizeScale: 1.5, color: '#ffffff', fontWeight: 'extrabold'
                }
            ],
            accentColor: '#00f5d4',
        };
        expect(PatternSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects a pattern missing required fields', () => {
        const invalid = { id: 'x', name: 'Bad' }; // missing background, textSlots, accentColor
        expect(PatternSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects invalid backgroundType', () => {
        const invalid = {
            id: 'x', name: 'X', description: 'X', tags: [],
            background: { type: 'video', value: '#fff', overlayOpacity: 0.5 }, // 'video' not allowed
            textSlots: [], accentColor: '#000',
        };
        expect(PatternSchema.safeParse(invalid).success).toBe(false);
    });
});
