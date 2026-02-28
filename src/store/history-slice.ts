import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/core/entities/project';

interface HistoryState {
    past: Project[];
    future: Project[];
}

const initialState: HistoryState = {
    past: [],
    future: [],
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        saveHistoryState: (state, action: PayloadAction<Project>) => {
            state.past.push(action.payload);
            state.future = []; // Clear future when a new action is performed
        },
        undoHistory: (state, action: PayloadAction<Project>) => {
            if (state.past.length > 0) {
                // The current state is provided via action payload, so we push it to future
                state.future.unshift(action.payload);
                // We pop the latest past state (managed by a thunk or middleware later to set active)
                state.past.pop();
            }
        },
        redoHistory: (state, action: PayloadAction<Project>) => {
            if (state.future.length > 0) {
                // Current state pushed to past
                state.past.push(action.payload);
                // We pop the first future state
                state.future.shift();
            }
        },
    },
});

export const { saveHistoryState, undoHistory, redoHistory } = historySlice.actions;
export default historySlice.reducer;
