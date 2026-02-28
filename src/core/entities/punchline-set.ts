import { z } from 'zod';

export const PunchlineSetSchema = z.object({
    headline: z.string().min(1),
    subheadline: z.string().optional(),
    cta: z.string().optional(),
    caption: z.string().optional(),
    contentType: z.enum(['meme', 'ad', 'promo']),
});

export type PunchlineSet = z.infer<typeof PunchlineSetSchema>;
