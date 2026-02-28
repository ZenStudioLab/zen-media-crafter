import { expect, describe, it } from 'vitest';
import { Project } from '@/core/entities/project';
import { Composition } from '@/core/entities/composition';
import { DesignJSON } from '@/core/entities/design-json';

describe('Project Entity', () => {
    it('creates an empty project', () => {
        const project = new Project('Test Project');
        expect(project.id).toBeDefined();
        expect(project.name).toBe('Test Project');
        expect(project.compositions.length).toBe(0);
    });

    it('adds a composition', () => {
        const project = new Project('Test');
        const design: DesignJSON = {
            version: '1.0',
            canvas: { width: 800, height: 600 },
            background: { type: 'solid', value: '#ffffff' },
            elements: []
        };
        const comp = new Composition('Variant A', design, 'openai');

        project.addComposition(comp);
        expect(project.compositions.length).toBe(1);
        expect(project.compositions[0]).toBe(comp);
    });
});
