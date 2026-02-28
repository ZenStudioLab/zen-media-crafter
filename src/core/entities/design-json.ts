import { z } from 'zod';

export const ElementStyleSchema = z.object({
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    color: z.string().optional(),
    fontWeight: z.enum(['normal', 'bold', 'extrabold']).optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
});

export const TransformSchema = z.object({
    scale: z.number().default(1),
    rotation: z.number().default(0),
    opacity: z.number().min(0).max(1).default(1),
});

export const ElementSchema = z.discriminatedUnion('type', [
    z.object({
        id: z.string(),
        type: z.literal('text'),
        content: z.string(),
        style: ElementStyleSchema,
        position: z.object({ x: z.number(), y: z.number(), zone: z.string().optional() }),
        layer: z.number().int().positive(),
    }),
    z.object({
        id: z.string(),
        type: z.literal('image'),
        src: z.string(),        // UserAsset ID reference
        transform: TransformSchema,
        position: z.object({ x: z.number(), y: z.number() }),
        layer: z.number().int().positive(),
    }),
    // Keeping shape for backward compat if any tests relied on it, but making it compliant with v1.0
    z.object({
        id: z.string(),
        type: z.literal('shape'),
        shapeType: z.enum(['rectangle', 'circle', 'triangle']),
        style: z.object({ backgroundColor: z.string().optional() }),
        position: z.object({ x: z.number(), y: z.number() }),
        layer: z.number().int().positive(),
    })
]);

export const BackgroundSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('solid'), value: z.string() }),
    z.object({
        type: z.literal('gradient'),
        from: z.string(),
        to: z.string(),
        direction: z.number().default(135),
    }),
    // The assetId vs src discrepancy is common; standardizing on src for image to match elements
    z.object({ type: z.literal('image'), src: z.string(), assetId: z.string().optional() }),
]);

export const OverlaySchema = z.object({
    type: z.enum(['solid', 'gradient', 'texture']),
    value: z.string(),
    opacity: z.number().min(0).max(1),
});

export const DesignJSONSchema = z.object({
    version: z.literal('1.0'),
    canvas: z.object({ width: z.number(), height: z.number() }),
    background: BackgroundSchema,
    overlay: OverlaySchema.optional(), // [v1.0 extension] Pattern overlay on top of background image
    elements: z.array(ElementSchema),
});

export type OverlayTreatment = z.infer<typeof OverlaySchema>;
export type ElementStyle = z.infer<typeof ElementStyleSchema>;
export type CanvasElement = z.infer<typeof ElementSchema>;
export type DesignJSON = z.infer<typeof DesignJSONSchema>;
