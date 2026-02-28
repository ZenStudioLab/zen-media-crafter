import { Pattern, TextSlot } from '@/core/entities/pattern';
import { PunchlineSet } from '@/core/entities/punchline-set';

const CONTENT_TYPE_ALLOWED_SLOTS: Record<PunchlineSet['contentType'], TextSlot['id'][]> = {
    meme: ['headline', 'caption'],
    ad: ['headline', 'subheadline', 'cta'],
    promo: ['headline', 'subheadline', 'cta', 'caption'],
};

export interface SlotMapping {
    slotId: TextSlot['id'];
    text: string;
    slot: TextSlot;
}

export function mapPunchlinesToSlots(
    punchlines: PunchlineSet,
    pattern: Pattern,
): SlotMapping[] {
    const allowed = CONTENT_TYPE_ALLOWED_SLOTS[punchlines.contentType];

    return pattern.textSlots
        .filter(slot => allowed.includes(slot.id))
        .flatMap(slot => {
            const text = punchlines[slot.id as keyof PunchlineSet] as string | undefined;
            if (!text) return [];
            return [{ slotId: slot.id, text, slot }];
        });
}
