'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setApiKey } from '@/store/api-keys-slice';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    Fab
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export function ApiKeyConfig() {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const apiKeys = useSelector((state: RootState) => state.apiKeys);
    const [localOpenAI, setLocalOpenAI] = useState(apiKeys.openai);
    const [localAnthropic, setLocalAnthropic] = useState(apiKeys.anthropic);
    const [localGemini, setLocalGemini] = useState(apiKeys.gemini);

    const handleSave = () => {
        dispatch(setApiKey({ provider: 'openai', key: localOpenAI }));
        dispatch(setApiKey({ provider: 'anthropic', key: localAnthropic }));
        dispatch(setApiKey({ provider: 'gemini', key: localGemini }));
        setOpen(false);
    };

    return (
        <>
            <Fab
                color="primary"
                aria-label="settings"
                onClick={() => setOpen(true)}
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
                <SettingsIcon />
            </Fab>

            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 300, p: 3 }} role="presentation">
                    <Typography variant="h6" gutterBottom>
                        API Configuration
                    </Typography>

                    <TextField
                        fullWidth
                        label="OpenAI API Key"
                        variant="outlined"
                        type="password"
                        margin="normal"
                        value={localOpenAI}
                        onChange={(e) => setLocalOpenAI(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Anthropic API Key"
                        variant="outlined"
                        type="password"
                        margin="normal"
                        value={localAnthropic}
                        onChange={(e) => setLocalAnthropic(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Gemini API Key"
                        variant="outlined"
                        type="password"
                        margin="normal"
                        value={localGemini}
                        onChange={(e) => setLocalGemini(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSave}
                        sx={{ mt: 2 }}
                    >
                        Save Keys
                    </Button>
                </Box>
            </Drawer>
        </>
    );
}
