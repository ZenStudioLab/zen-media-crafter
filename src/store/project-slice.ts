import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Redux generally requires serializable state, so we use a POJO representation
// rather than class instances if possible, but RTK can be configured to ignore it.
const initialState: any = {
    activeProject: null,
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setActiveProject: (state, action: PayloadAction<any>) => {
            state.activeProject = action.payload;
        },
        addCompositionToActive: (state, action: PayloadAction<any>) => {
            if (state.activeProject) {
                state.activeProject.compositions.push(action.payload);
            }
        },
    },
});

export const { setActiveProject, addCompositionToActive } = projectSlice.actions;
export default projectSlice.reducer;
