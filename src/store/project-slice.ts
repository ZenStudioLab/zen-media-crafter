import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/core/entities/project';
import { Composition } from '@/core/entities/composition';

interface ProjectState {
    activeProject: Project | null;
}

const initialState: ProjectState = {
    activeProject: null,
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setActiveProject: (state, action: PayloadAction<Project>) => {
            state.activeProject = action.payload;
        },
        addCompositionToActive: (state, action: PayloadAction<Composition>) => {
            if (state.activeProject) {
                state.activeProject.compositions.push(action.payload);
            }
        },
    },
});

export const { setActiveProject, addCompositionToActive } = projectSlice.actions;
export default projectSlice.reducer;
