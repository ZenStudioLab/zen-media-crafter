import { UserAsset } from '@/core/entities/user-asset';

/**
 * CopyVariations: A simple map from element-slot ID to suggested copy text.
 * e.g. { headline: "Shop the Summer Sale", cta: "Grab 50% Off Now" }
 * This is what the LLM returns — never a full DesignJSON.
 */
export type CopyVariations = Record<string, string>;

export interface ILLMProvider {
    /**
     * Unique identifier for the provider (e.g., 'openai-gpt4o')
     */
    readonly id: string;

    /**
     * Generates improved copy variations for existing text slots.
     * Returns a flat map of { slotId -> improved text }.
     * @param prompt - Context prompt describing the ad type, style, and existing copy
     * @param assets - Optional background assets for reference
     */
    generateCopyVariations(prompt: string, assets?: UserAsset[]): Promise<CopyVariations>;
}
