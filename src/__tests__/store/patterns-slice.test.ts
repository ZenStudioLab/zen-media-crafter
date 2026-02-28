import { describe, it, expect } from 'vitest';
import { patternsReducer, selectPattern, deselectPattern, addCustomPattern } from '../../store/patterns-slice';
import { Pattern } from '../../core/entities/pattern';

describe('patternsReducer', () => {
    const initialState = {
        availablePatterns: [],
        selectedPatternIds: [],
        customPatterns: [],
    };

    const testPattern: Pattern = {
        id: 'test',
        name: 'Test Pattern',
        description: '',
        tags: [],
        background: { type: 'solid', value: '#000', overlayOpacity: 0.5 },
        textSlots: [],
        accentColor: '#fff',
    };

    it('handles selecting a pattern', () => {
        const nextState = patternsReducer(initialState, selectPattern('pattern-1'));
        expect(nextState.selectedPatternIds).toContain('pattern-1');
    });

    it('handles deselecting a pattern', () => {
        const stateWithSelection = { ...initialState, selectedPatternIds: ['pattern-1', 'pattern-2'] };
        const nextState = patternsReducer(stateWithSelection, deselectPattern('pattern-1'));
        expect(nextState.selectedPatternIds).not.toContain('pattern-1');
        expect(nextState.selectedPatternIds).toContain('pattern-2');
    });

    it('handles adding a custom pattern', () => {
        const nextState = patternsReducer(initialState, addCustomPattern(testPattern));
        expect(nextState.customPatterns).toHaveLength(1);
        expect(nextState.customPatterns[0].id).toBe('test');
        expect(nextState.availablePatterns).toHaveLength(1);
    });
});
