import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApiKeysState {
    openai: string;
    gemini: string;
    anthropic: string;
}

const initialState: ApiKeysState = {
    openai: '',
    gemini: '',
    anthropic: '',
};

const apiKeysSlice = createSlice({
    name: 'apiKeys',
    initialState,
    reducers: {
        setApiKey: (
            state,
            action: PayloadAction<{ provider: keyof ApiKeysState; key: string }>
        ) => {
            state[action.payload.provider] = action.payload.key;
        },
        clearApiKey: (state, action: PayloadAction<keyof ApiKeysState>) => {
            state[action.payload] = '';
        },
    },
});

export const { setApiKey, clearApiKey } = apiKeysSlice.actions;
export default apiKeysSlice.reducer;
