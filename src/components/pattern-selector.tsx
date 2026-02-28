'use client';

import { clsx } from 'clsx';
import { Pattern } from '@/core/entities/pattern';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { selectPattern, deselectPattern } from '@/store/patterns-slice';
import { Check, Info } from 'lucide-react';
import React from 'react';

// A tiny stub visual representation of a pattern
const MiniPatternPreview = ({ pattern }: { pattern: Pattern }) => {
    const bgStyle = React.useMemo(() => {
        if (pattern.background.type === 'solid') return { backgroundColor: pattern.background.value };
        if (pattern.background.type === 'gradient') return { background: pattern.background.value };
        return { backgroundColor: '#e5e7eb' };
    }, [pattern.background]);

    return (
        <div
            className="relative w-full h-24 rounded-t-md overflow-hidden bg-gray-200"
            style={bgStyle}
        >
            <div
                className="absolute inset-0 bg-black"
                style={{ opacity: pattern.background.overlayOpacity * 0.5 }}
            />

            {/* Abstract lines for text slots */}
            <div className="absolute inset-0 flex flex-col p-2 pointer-events-none">
                {pattern.textSlots.map(slot => (
                    <div
                        key={slot.id}
                        className={clsx(
                            "h-1.5 rounded-full mb-1 opacity-80",
                            slot.zone === 'top' ? 'mt-1' : slot.zone === 'bottom' ? 'mt-auto mb-1' : 'my-auto',
                            slot.align === 'left' ? 'w-1/2 ml-0' : slot.align === 'right' ? 'w-1/2 ml-auto' : 'w-2/3 mx-auto'
                        )}
                        style={{ backgroundColor: slot.color }}
                    />
                ))}
            </div>

            {/* Accent color dot */}
            <div
                className="absolute bottom-2 right-2 w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: pattern.accentColor }}
            />
        </div>
    );
};

export const PatternSelector = () => {
    const dispatch = useAppDispatch();
    const availablePatterns = useAppSelector(state => state.patterns.availablePatterns);
    const selectedIds = useAppSelector(state => state.patterns.selectedPatternIds);

    const handleToggle = (patternId: string) => {
        if (selectedIds.includes(patternId)) {
            dispatch(deselectPattern(patternId));
        } else {
            dispatch(selectPattern(patternId));
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Visual Patterns</h3>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {selectedIds.length} Variant{selectedIds.length !== 1 ? 's' : ''} Selected
                </span>
            </div>

            <p className="text-xs text-gray-500 mb-4 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                We&apos;ll generate one clean, ready-to-use variant for every pattern you select below.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePatterns.map(pattern => {
                    const isSelected = selectedIds.includes(pattern.id);
                    return (
                        <div
                            key={pattern.id}
                            onClick={() => handleToggle(pattern.id)}
                            className={clsx(
                                "group relative border rounded-lg overflow-hidden cursor-pointer transition-all duration-200",
                                isSelected
                                    ? "border-blue-500 ring-1 ring-blue-500 shadow-sm"
                                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                            )}
                        >
                            <MiniPatternPreview pattern={pattern} />

                            <div className="p-3 bg-white">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold text-gray-900 truncate pr-2" title={pattern.name}>
                                        {pattern.name}
                                    </h4>
                                    <div className={clsx(
                                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-400"
                                    )}>
                                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                </div>

                                {/* tags */}
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    {pattern.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
