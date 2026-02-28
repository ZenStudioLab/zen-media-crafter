import { describe, it, expect } from 'vitest';
import { PunchlineSetSchema } from '../../../core/entities/punchline-set';

describe('PunchlineSet Entity', () => {
    it('validates a minimal ad punchline set', () => {
        expect(PunchlineSetSchema.safeParse({
            headline: '50% Off Today',
            contentType: 'ad',
        }).success).toBe(true);
    });

    it('validates a full meme punchline set', () => {
        expect(PunchlineSetSchema.safeParse({
            headline: 'When the code finally works',
            caption: 'And then you realize it works only on your machine',
            contentType: 'meme',
        }).success).toBe(true);
    });

    it('rejects missing headline', () => {
        expect(PunchlineSetSchema.safeParse({ contentType: 'ad' }).success).toBe(false);
    });
});
