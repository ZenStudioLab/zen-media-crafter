import { DesignJSON } from '@/core/entities/design-json';

export interface ILLMProvider {
    /**
     * Generates a new layout composition.
     * @param prompt User's creative prompt.
     * @param baseDesign Optional base design to tweak.
     * @returns A Promise resolving to a DesignJSON object.
     */
    generate(prompt: string, baseDesign?: DesignJSON): Promise<DesignJSON>;
}
