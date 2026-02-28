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
    const { canvas, elements, background, overlay } = design;

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    const renderBackground = () => {
        if (background.type === 'solid') {
            return <Box sx={{ position: 'absolute', inset: 0, backgroundColor: background.value }} />;
        }
        if (background.type === 'gradient') {
            return <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(${background.direction}deg, ${background.from}, ${background.to})` }} />;
        }
        if (background.type === 'image') {
            return (
                <Box
                    sx={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${background.src})`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }}
                />
            );
        }
        return null;
    };

    const renderOverlay = () => {
        if (!overlay) return null;
        if (overlay.type === 'solid') {
            return <Box sx={{ position: 'absolute', inset: 0, backgroundColor: overlay.value, opacity: overlay.opacity, zIndex: 1 }} />;
        }
        if (overlay.type === 'gradient') {
            return <Box sx={{ position: 'absolute', inset: 0, background: overlay.value, opacity: overlay.opacity, zIndex: 1 }} />;
        }
        return null;
    };

    return (
        <Box
            sx={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#e5e7eb',
                boxShadow: 3,
            }}
            data-testid="mock-renderer-canvas"
        >
            {renderBackground()}
            {renderOverlay()}

            {elements.sort((a, b) => a.layer - b.layer).map((el) => {
                const zIndex = el.layer + 2; // Above bg(0) and overlay(1)

                if (el.type === 'text') {
                    return (
                        <Typography
                            key={el.id}
                            style={{
                                position: 'absolute',
                                left: `${el.position.x * scale}px`,
                                top: `${el.position.y * scale}px`,
                                transform: 'translate(-50%, -50%)', // Center alignment for slots
                                fontSize: el.style.fontSize ? `${el.style.fontSize * scale}px` : undefined,
                                color: el.style.color,
                                fontFamily: el.style.fontFamily,
                                fontWeight: el.style.fontWeight === 'extrabold' ? 800 : el.style.fontWeight === 'bold' ? 700 : 400,
                                zIndex,
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                                textShadow: '0px 2px 4px rgba(0,0,0,0.5)' // basic shadow for visibility
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
                                left: `${el.position.x * scale}px`,
                                top: `${el.position.y * scale}px`,
                                zIndex,
                                transformOrigin: 'top left',
                                transform: `scale(${el.transform.scale}) rotate(${el.transform.rotation}deg)`,
                                opacity: el.transform.opacity
                            }}
                        />
                    );
                }

                return null;
            })}
        </Box>
    );
};
