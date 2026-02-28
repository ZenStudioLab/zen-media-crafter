"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setActiveProject, addCompositionToActive } from '@/store/project-slice';
import { setIsGenerating, setSelectedProvider } from '@/store/ui-slice';
import { updatePunchlines, setBackgroundImageId, setUseLLMCopyVariation } from '@/store/generation-input-slice';
import { setPresets } from '@/store/patterns-slice';
import { presetPatterns } from '@/store/preset-patterns';
import { Project } from '@/core/entities/project';
import { UserAsset } from '@/core/entities/user-asset';
import { Composition } from '@/core/entities/composition';
import { MockRenderer } from '@/components/mock-renderer';
import { PatternSelector } from '@/components/pattern-selector';
import {
    Box, Drawer, Toolbar, Typography, TextField,
    Button, MenuItem, Select, FormControl, InputLabel,
    Grid, CircularProgress, Alert, Switch, FormControlLabel, Divider, SelectChangeEvent
} from '@mui/material';

const drawerWidth = 360;

// Temporary mock asset for the active "upload"
const mockUploadedAsset: UserAsset = {
    id: 'asset-hero-1',
    name: 'Hero Image',
    blobUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1080&auto=format&fit=crop',
    width: 1080,
    height: 1080,
};

export default function GeneratePage() {
    const dispatch = useDispatch();
    const { activeProject } = useSelector((state: RootState) => state.project);
    const { isGenerating, selectedProvider } = useSelector((state: RootState) => state.ui);
    const { punchlines, backgroundImageId, useLLMCopyVariation } = useSelector((state: RootState) => state.generationInput);
    const { selectedPatternIds, availablePatterns } = useSelector((state: RootState) => state.patterns);
    const apiKeys = useSelector((state: RootState) => state.apiKeys);

    const [error, setError] = useState<string | null>(null);

    // Initialize store with preset template library & select a default project/image
    useEffect(() => {
        dispatch(setPresets(presetPatterns));
        if (!activeProject) {
            dispatch(setActiveProject(new Project('Campaign: Summer Launch')));
        }
        if (!backgroundImageId) {
            dispatch(setBackgroundImageId(mockUploadedAsset.id));
        }
    }, [activeProject, backgroundImageId, dispatch]);

    const handleGenerate = async () => {
        setError(null);
        if (!backgroundImageId) {
            setError("Please select a background image first.");
            return;
        }
        if (selectedPatternIds.length === 0) {
            setError("Please select at least one visual pattern.");
            return;
        }

        // Only validate API key if we are running in LLM copy variation mode
        const apiKey = apiKeys[selectedProvider as keyof typeof apiKeys];
        if (useLLMCopyVariation && !apiKey) {
            setError(`Please configure your ${selectedProvider.toUpperCase()} API Key first using the Gear icon for copy variations.`);
            return;
        }

        dispatch(setIsGenerating(true));

        try {
            const selectedPatterns = availablePatterns.filter(p => selectedPatternIds.includes(p.id));

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(useLLMCopyVariation && apiKey ? { 'x-api-key': apiKey } : {})
                },
                body: JSON.stringify({
                    backgroundImage: mockUploadedAsset,
                    punchlines,
                    patterns: selectedPatterns,
                    providerName: useLLMCopyVariation ? selectedProvider : undefined,
                    useLLMCopyVariation
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate layouts');
            }

            const data = await res.json();
            data.compositions.forEach((comp: Composition) => {
                dispatch(addCompositionToActive(comp));
            });

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            dispatch(setIsGenerating(false));
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', p: 3 },
                }}
            >
                <Toolbar />
                <Typography variant="h6" gutterBottom>Generation Settings</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                    {/* 1. Content Input */}
                    <Box>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold' }}>1. Content</Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Content Type</InputLabel>
                            <Select
                                value={punchlines.contentType}
                                label="Content Type"
                                onChange={(e: SelectChangeEvent<string>) => dispatch(updatePunchlines({ contentType: e.target.value as 'ad' | 'promo' | 'meme' }))}
                            >
                                <MenuItem value="ad">Advertisement</MenuItem>
                                <MenuItem value="promo">Social Promo</MenuItem>
                                <MenuItem value="meme">Meme</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Headline" size="small" fullWidth sx={{ mb: 1.5 }}
                            value={punchlines.headline}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(updatePunchlines({ headline: e.target.value }))}
                        />
                        {punchlines.contentType !== 'meme' && (
                            <TextField
                                label="Sub-headline" size="small" fullWidth sx={{ mb: 1.5 }}
                                value={punchlines.subheadline || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(updatePunchlines({ subheadline: e.target.value }))}
                            />
                        )}
                        {punchlines.contentType !== 'meme' && (
                            <TextField
                                label="Call to Action (CTA)" size="small" fullWidth sx={{ mb: 1.5 }}
                                value={punchlines.cta || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(updatePunchlines({ cta: e.target.value }))}
                            />
                        )}
                        {(punchlines.contentType === 'meme' || punchlines.contentType === 'promo') && (
                            <TextField
                                label="Caption (Bottom text)" size="small" fullWidth sx={{ mb: 1.5 }}
                                value={punchlines.caption || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(updatePunchlines({ caption: e.target.value }))}
                            />
                        )}
                    </Box>

                    <Divider />

                    {/* 2. Visual Templates */}
                    <Box className="w-full">
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold' }}>2. Visual Style</Typography>
                        <PatternSelector />
                    </Box>

                    <Divider />

                    {/* 3. AI Copilot (Optional) */}
                    <Box>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5, fontWeight: 'bold' }}>3. AI Copilot</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={useLLMCopyVariation}
                                    onChange={(e) => dispatch(setUseLLMCopyVariation(e.target.checked))}
                                />
                            }
                            label={<Typography variant="body2">Suggest Copy Variations</Typography>}
                        />

                        {useLLMCopyVariation && (
                            <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                                <InputLabel>AI Provider</InputLabel>
                                <Select
                                    value={selectedProvider}
                                    label="AI Provider"
                                    onChange={(e: SelectChangeEvent<string>) => dispatch(setSelectedProvider(e.target.value as 'openai' | 'anthropic' | 'gemini'))}
                                >
                                    <MenuItem value="openai">OpenAI (GPT-4o)</MenuItem>
                                    <MenuItem value="anthropic">Anthropic (Claude)</MenuItem>
                                    <MenuItem value="gemini">Google (Gemini Pro)</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleGenerate}
                        disabled={isGenerating || !punchlines.headline.trim() || selectedPatternIds.length === 0}
                        sx={{ mt: 1, py: 1.5 }}
                    >
                        {isGenerating ? <CircularProgress size={24} color="inherit" /> : `Generate ${selectedPatternIds.length} Variants`}
                    </Button>

                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Toolbar />
                <Typography variant="h4" gutterBottom>
                    {activeProject?.name || 'Loading Project...'}
                </Typography>

                {activeProject?.compositions.length === 0 && !isGenerating && (
                    <Typography color="text.secondary">
                        No compositions generated yet. Use the sidebar to generate some layouts.
                    </Typography>
                )}

                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {activeProject?.compositions.map((comp) => (
                        <Grid key={comp.id}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                {comp.name}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    (via {comp.generatedBy})
                                </Typography>
                            </Typography>
                            {/* Render using the mock renderer */}
                            {/* Calculate an appropriate scale factor for thumbnails, assuming canvas might be 1080 */}
                            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', display: 'inline-block' }}>
                                <MockRenderer design={comp.designJson} scale={0.25} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}
