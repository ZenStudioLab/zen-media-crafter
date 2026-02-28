import { describe, it, expect } from 'vitest';
import historyReducer, { saveHistoryState, undoHistory, redoHistory } from '@/store/history-slice';
import { Project } from '@/core/entities/project';

describe('History Slice', () => {
    const initialState = { past: [], future: [] };

    it('should return the initial state', () => {
        expect(historyReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle saveHistoryState', () => {
        const project1 = new Project('Test Project 1');
        const nextState = historyReducer(initialState, saveHistoryState(project1));

        expect(nextState.past).toHaveLength(1);
        expect(nextState.past[0]).toBe(project1);
        expect(nextState.future).toHaveLength(0);
    });

    it('should handle saveHistoryState and clear future', () => {
        const project1 = new Project('Test Project 1');
        const stateWithFuture = { past: [], future: [new Project('Future')] };
        const nextState = historyReducer(stateWithFuture, saveHistoryState(project1));

        expect(nextState.past).toHaveLength(1);
        expect(nextState.past[0]).toBe(project1);
        expect(nextState.future).toHaveLength(0); // Future should be wiped when a new action is saved
    });

    it('should handle undoHistory', () => {
        const project1 = new Project('Test Project 1');
        const project2 = new Project('Test Project 2');

        // Let's say project2 is the current active state, and project1 is in the past
        const state = { past: [project1], future: [] };

        // We trigger undo, pushing the current state (project2) to future, and returning project1
        const activeState = project2;
        const nextState = historyReducer(state, undoHistory(activeState));

        expect(nextState.past).toHaveLength(0);
        expect(nextState.future).toHaveLength(1);
        expect(nextState.future[0]).toBe(project2);
    });

    it('should handle redoHistory', () => {
        const project1 = new Project('Test Project 1');
        const project2 = new Project('Test Project 2');

        // Assume project1 is current, and project2 is in the future
        const state = { past: [], future: [project2] };

        // We trigger redo, pushing current state (project1) to past, returning project2
        const activeState = project1;
        const nextState = historyReducer(state, redoHistory(activeState));

        expect(nextState.past).toHaveLength(1);
        expect(nextState.past[0]).toBe(project1);
        expect(nextState.future).toHaveLength(0);
    });
});
