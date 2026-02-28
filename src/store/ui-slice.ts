import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    selectedProvider: 'openai' | 'gemini' | 'anthropic' | 'ollama';
    isGenerating: boolean;
    selectedVariantId: string | null;
}

const initialState: UiState = {
    theme: 'dark',
    sidebarOpen: true,
    selectedProvider: 'openai',
    isGenerating: false,
    selectedVariantId: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSelectedProvider: (state, action: PayloadAction<UiState['selectedProvider']>) => {
            state.selectedProvider = action.payload;
        },
        setIsGenerating: (state, action: PayloadAction<boolean>) => {
            state.isGenerating = action.payload;
        },
        setSelectedVariantId: (state, action: PayloadAction<string | null>) => {
            state.selectedVariantId = action.payload;
        },
    },
});

export const {
    toggleTheme,
    toggleSidebar,
    setSelectedProvider,
    setIsGenerating,
    setSelectedVariantId,
} = uiSlice.actions;
export default uiSlice.reducer;
