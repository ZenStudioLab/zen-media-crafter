import React from 'react';
import { DesignJSON } from '@/core/entities/design-json';
import { Box, Typography } from '@mui/material';

interface MockRendererProps {
    design: DesignJSON;
    scale?: number;
}

/**
 * MockRenderer is a fast HTML/CSS preview layer for DesignJSON instances.
 * It strictly maps the JSON abstractions into simple DOM rendering (absolute positioning).
 */
export const MockRenderer: React.FC<MockRendererProps> = ({ design, scale = 1 }) => {
    const { canvas, elements } = design;

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    return (
        <Box
            sx={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'transparent',
                boxShadow: 3,
            }}
            data-testid="mock-renderer-canvas"
        >
            {elements.map((el, index) => {
                const zIndex = index + 1;

                if (el.type === 'text') {
                    return (
                        <Typography
                            key={el.id}
                            style={{
                                position: 'absolute',
                                left: `${el.style.x * scale}px`,
                                top: `${el.style.y * scale}px`,
                                fontSize: el.style.fontSize ? `${el.style.fontSize * scale}px` : undefined,
                                color: el.style.color,
                                fontFamily: el.style.fontFamily,
                                zIndex,
                                whiteSpace: 'nowrap',
                                backgroundColor: el.style.backgroundColor
                            }}
                        >
                            {el.content}
                        </Typography>
                    );
                }

                if (el.type === 'image') {
                    return (
                        <Box
                            key={el.id}
                            component="img"
                            src={el.src}
                            alt="Design element"
                            sx={{
                                position: 'absolute',
                                left: `${el.style.x * scale}px`,
                                top: `${el.style.y * scale}px`,
                                width: el.style.width ? `${el.style.width * scale}px` : undefined,
                                height: el.style.height ? `${el.style.height * scale}px` : undefined,
                                zIndex,
                                transformOrigin: 'top left',
                            }}
                        />
                    );
                }

                return null;
            })}
        </Box>
    );
};
