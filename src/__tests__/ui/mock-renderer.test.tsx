// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { MockRenderer } from '@/components/mock-renderer';
import { DesignJSON } from '@/core/entities/design-json';

describe('MockRenderer', () => {
    afterEach(cleanup);

    const mockDesign: DesignJSON = {
        version: '1.0',
        canvas: { width: 1080, height: 1080 },
        elements: [
            {
                id: 'text-1',
                type: 'text',
                content: 'Hello World',
                style: {
                    x: 100,
                    y: 200,
                    fontSize: 48,
                    color: '#ffffff',
                    fontFamily: 'Arial',
                },
            },
        ],
    };

    it('renders the canvas background correctly', () => {
        const { container } = render(<MockRenderer design={mockDesign} scale={0.5} />);
        const canvas = container.firstChild as HTMLElement;
        expect(canvas).toHaveStyle({
            width: '540px',
            height: '540px',
            position: 'relative',
        });
    });

    it('renders text elements mapped to CSS properties', () => {
        render(<MockRenderer design={mockDesign} scale={0.5} />);
        const textElement = screen.getByText('Hello World');
        expect(textElement).toBeInTheDocument();
        expect(textElement).toHaveStyle({
            position: 'absolute',
            left: '50px',
            top: '100px',
            fontSize: '24px',
            color: 'rgb(255, 255, 255)',  // JSDOM converts Hex to rgb
            fontFamily: 'Arial',
            zIndex: '1',
        });
    });
});
