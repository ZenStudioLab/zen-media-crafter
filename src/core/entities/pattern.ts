import { z } from 'zod';

export const TextSlotSchema = z.object({
    id: z.enum(['headline', 'subheadline', 'cta', 'caption']),
    zone: z.enum(['top', 'center', 'bottom']),
    align: z.enum(['left', 'center', 'right']),
    fontFamily: z.string(),
    fontSizeScale: z.number().positive(),
    color: z.string(),
    fontWeight: z.enum(['normal', 'bold', 'extrabold']),
});

export const BackgroundTreatmentSchema = z.object({
    type: z.enum(['solid', 'gradient', 'texture']),
    value: z.string(),
    overlayOpacity: z.number().min(0).max(1),
});

export const PatternSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string(),
    tags: z.array(z.string()),
    background: BackgroundTreatmentSchema,
    textSlots: z.array(TextSlotSchema),
    accentColor: z.string(),
    promptHints: z.string().optional(),
});

export type TextSlot = z.infer<typeof TextSlotSchema>;
export type BackgroundTreatment = z.infer<typeof BackgroundTreatmentSchema>;
export type Pattern = z.infer<typeof PatternSchema>;
