import { expect, describe, it } from 'vitest';
import { DesignJSONSchema } from '@/core/entities/design-json';

describe('DesignJSONSchema', () => {
    it('validates a correct DesignJSON object', () => {
        const validData = {
            version: '1.0.0',
            canvas: {
                width: 1920,
                height: 1080,
            },
            elements: [
                {
                    id: 'element-1',
                    type: 'text',
                    content: 'Hello World',
                    src: null,
                    shapeType: null,
                    style: {
                        x: 100,
                        y: 100,
                        width: null,
                        height: null,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        color: '#000000',
                        backgroundColor: null,
                    },
                },
                {
                    id: 'element-2',
                    type: 'image',
                    content: null,
                    src: 'https://example.com/image.png',
                    shapeType: null,
                    style: {
                        x: 200,
                        y: 200,
                        width: 500,
                        height: 500,
                        fontSize: null,
                        fontFamily: null,
                        color: null,
                        backgroundColor: null,
                    },
                },
            ],
        };

        const result = DesignJSONSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('fails validation when canvas dimensions are missing', () => {
        const invalidData = {
            version: '1.0.0',
            elements: [],
        };

        const result = DesignJSONSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('fails validation when an element has an invalid type', () => {
        const invalidData = {
            version: '1.0.0',
            canvas: { width: 1080, height: 1080 },
            elements: [
                {
                    id: 'element-3',
                    type: 'unknown-type',
                    style: { x: 0, y: 0, width: 100, height: 100 },
                },
            ],
        };

        const result = DesignJSONSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
