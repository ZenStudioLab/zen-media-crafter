import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pattern } from '../core/entities/pattern';

export interface PatternsState {
    availablePatterns: Pattern[];
    selectedPatternIds: string[];
    customPatterns: Pattern[];
}

const initialState: PatternsState = {
    // Preset patterns will be merged into availablePatterns at store initialization
    availablePatterns: [],
    selectedPatternIds: [],
    customPatterns: [],
};

export const patternsSlice = createSlice({
    name: 'patterns',
    initialState,
    reducers: {
        selectPattern: (state, action: PayloadAction<string>) => {
            if (!state.selectedPatternIds.includes(action.payload)) {
                state.selectedPatternIds.push(action.payload);
            }
        },
        deselectPattern: (state, action: PayloadAction<string>) => {
            state.selectedPatternIds = state.selectedPatternIds.filter(id => id !== action.payload);
        },
        addCustomPattern: (state, action: PayloadAction<Pattern>) => {
            state.customPatterns.push(action.payload);
            state.availablePatterns.push(action.payload);
        },
        setPresets: (state, action: PayloadAction<Pattern[]>) => {
            state.availablePatterns = [...action.payload, ...state.customPatterns];
            // Auto-select first preset pattern if none selected
            if (state.selectedPatternIds.length === 0 && action.payload.length > 0) {
                state.selectedPatternIds = [action.payload[0].id];
            }
        }
    },
});

export const { selectPattern, deselectPattern, addCustomPattern, setPresets } = patternsSlice.actions;

export const patternsReducer = patternsSlice.reducer;
