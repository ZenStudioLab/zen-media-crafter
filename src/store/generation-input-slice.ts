import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PunchlineSet } from '../core/entities/punchline-set';

export interface GenerationInputState {
    backgroundImageId: string | null;
    punchlines: PunchlineSet;
    useLLMCopyVariation: boolean;
}

const initialState: GenerationInputState = {
    backgroundImageId: null,
    punchlines: {
        headline: 'Summer Sale Starts Now',
        subheadline: 'Up to 50% off sitewide',
        cta: 'Shop Now',
        caption: 'Limited time offer. T&Cs apply.',
        contentType: 'ad',
    },
    useLLMCopyVariation: false,
};

export const generationInputSlice = createSlice({
    name: 'generationInput',
    initialState,
    reducers: {
        setBackgroundImageId: (state, action: PayloadAction<string | null>) => {
            state.backgroundImageId = action.payload;
        },
        updatePunchlines: (state, action: PayloadAction<Partial<PunchlineSet>>) => {
            state.punchlines = { ...state.punchlines, ...action.payload };
        },
        setUseLLMCopyVariation: (state, action: PayloadAction<boolean>) => {
            state.useLLMCopyVariation = action.payload;
        }
    },
});

export const {
    setBackgroundImageId,
    updatePunchlines,
    setUseLLMCopyVariation
} = generationInputSlice.actions;

export const generationInputReducer = generationInputSlice.reducer;
