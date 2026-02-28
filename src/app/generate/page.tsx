'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setActiveProject, addCompositionToActive } from '@/store/project-slice';
import { setIsGenerating, setSelectedProvider } from '@/store/ui-slice';
import { Project } from '@/core/entities/project';
import { MockRenderer } from '@/components/mock-renderer';
import {
    Box, Drawer, Toolbar, Typography, TextField,
    Button, MenuItem, Select, FormControl, InputLabel,
    Grid, CircularProgress, Alert
} from '@mui/material';

const drawerWidth = 320;

export default function GeneratePage() {
    const dispatch = useDispatch();
    const { activeProject } = useSelector((state: RootState) => state.project);
    const { isGenerating, selectedProvider } = useSelector((state: RootState) => state.ui);
    const apiKeys = useSelector((state: RootState) => state.apiKeys);

    const [prompt, setPrompt] = useState('A sleek modern promotional banner for a summer sale');
    const [count, setCount] = useState(4);
    const [error, setError] = useState<string | null>(null);

    // Initialize an active project if not present
    useEffect(() => {
        if (!activeProject) {
            dispatch(setActiveProject(new Project('Untitled Generator Project')));
        }
    }, [activeProject, dispatch]);

    const handleGenerate = async () => {
        setError(null);

        // Ensure provider has an API key configured
        const apiKey = apiKeys[selectedProvider as keyof typeof apiKeys];
        if (!apiKey) {
            setError(`Please configure your ${selectedProvider.toUpperCase()} API Key first using the Gear icon.`);
            return;
        }

        dispatch(setIsGenerating(true));

        try {
            const startIndex = activeProject?.compositions.length || 0;
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    prompt,
                    count,
                    providerName: selectedProvider,
                    startIndex
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate layouts');
            }

            const data = await res.json();

            // Map the parsed JSON back into Compositions
            // Assuming Next.js /api returned serialized JSON Compositions.
            data.compositions.forEach((comp: any) => {
                dispatch(addCompositionToActive(comp));
            });

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            dispatch(setIsGenerating(false));
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', p: 3 },
                }}
            >
                <Toolbar /> {/* Spacer for top app bar if any */}
                <Typography variant="h6" gutterBottom>
                    Controls
                </Typography>

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField
                        label="Prompt"
                        multiline
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isGenerating}
                        fullWidth
                    />

                    <TextField
                        label="Variants Count"
                        type="number"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        inputProps={{ min: 1, max: 10 }}
                        disabled={isGenerating}
                        fullWidth
                    />

                    <FormControl fullWidth disabled={isGenerating}>
                        <InputLabel>Logic Provider</InputLabel>
                        <Select
                            value={selectedProvider}
                            label="Logic Provider"
                            onChange={(e) => dispatch(setSelectedProvider(e.target.value as any))}
                        >
                            <MenuItem value="openai">OpenAI (GPT-4o)</MenuItem>
                            <MenuItem value="anthropic">Anthropic (Claude)</MenuItem>
                            <MenuItem value="gemini">Google (Gemini Pro)</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                    >
                        {isGenerating ? <CircularProgress size={24} color="inherit" /> : 'Generate Layouts'}
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
                                <MockRenderer design={comp.design} scale={0.25} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}
