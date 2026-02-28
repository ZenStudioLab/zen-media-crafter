import { z } from 'zod';

export const ElementStyleSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    fontSize: z.number().nullable(),
    fontFamily: z.string().nullable(),
    color: z.string().nullable(),
    backgroundColor: z.string().nullable(),
});

export const CanvasElementSchema = z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'shape']),
    style: ElementStyleSchema,
    content: z.string().nullable(),
    src: z.string().nullable(),
    shapeType: z.enum(['rectangle', 'circle', 'triangle']).nullable(),
});

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
