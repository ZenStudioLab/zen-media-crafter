import { z } from 'zod';

export const ElementStyleSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
});

export const BaseElementSchema = z.object({
    id: z.string(),
    style: ElementStyleSchema,
});

export const TextElementSchema = BaseElementSchema.extend({
    type: z.literal('text'),
    content: z.string(),
});

export const ImageElementSchema = BaseElementSchema.extend({
    type: z.literal('image'),
    src: z.string(),
});

export const ShapeElementSchema = BaseElementSchema.extend({
    type: z.literal('shape'),
    shapeType: z.enum(['rectangle', 'circle', 'triangle']),
});

export const CanvasElementSchema = z.discriminatedUnion('type', [
    TextElementSchema,
    ImageElementSchema,
    ShapeElementSchema,
]);

export const CanvasDimensionsSchema = z.object({
    width: z.number().positive(),
    height: z.number().positive(),
});

export const DesignJSONSchema = z.object({
    version: z.string(),
    canvas: CanvasDimensionsSchema,
    elements: z.array(CanvasElementSchema),
});

export type ElementStyle = z.infer<typeof ElementStyleSchema>;
export type CanvasElement = z.infer<typeof CanvasElementSchema>;
export type DesignJSON = z.infer<typeof DesignJSONSchema>;
