import { Pattern } from '@/core/entities/pattern';
import { PunchlineSet } from '@/core/entities/punchline-set';
import { UserAsset } from '@/core/entities/user-asset';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { Composition } from '@/core/entities/composition';
import { DesignJSON } from '@/core/entities/design-json';
import { mapPunchlinesToSlots } from './map-punchlines-to-slots';

export interface GenerateInput {
    backgroundImage: UserAsset;
    punchlines: PunchlineSet;
    patterns: Pattern[];
    provider: ILLMProvider;
    useLLMCopyVariation: boolean;
}

export class GenerateLayouts {
    static async execute(input: GenerateInput): Promise<Composition[]> {
        const { backgroundImage, punchlines, patterns, provider, useLLMCopyVariation } = input;

        return await Promise.all(
            patterns.map(async (pattern) => {
                const slotMappings = mapPunchlinesToSlots(punchlines, pattern);

                const textElements = slotMappings.map((m, i) => ({
                    id: m.slotId,
                    type: 'text' as const,
                    content: m.text,
                    style: {
                        fontFamily: m.slot.fontFamily,
                        fontSize: Math.round(48 * m.slot.fontSizeScale),
                        color: m.slot.color,
                        fontWeight: m.slot.fontWeight,
                    },
                    position: zoneToPosition(m.slot.zone, m.slot.align),
                    layer: 3 + i,
                }));

                const designJson: DesignJSON = {
                    version: '1.0',
                    canvas: { width: 1080, height: 1080 },
                    background: { type: 'image', src: backgroundImage.blobUrl, assetId: backgroundImage.id },
                    overlay: {
                        type: pattern.background.type,
                        value: pattern.background.value,
                        opacity: pattern.background.overlayOpacity,
                    },
                    elements: textElements as DesignJSON['elements'],
                };

                if (useLLMCopyVariation && pattern.promptHints) {
                    const copyPrompt = buildCopyPrompt(punchlines, pattern);
                    // Ask the LLM for simple text variations only — never for a full DesignJSON
                    const variations = await provider.generateCopyVariations(copyPrompt, [backgroundImage]);
                    designJson.elements = mergeWithCopyVariations(designJson.elements, variations);
                }

                return new Composition(pattern.name, designJson, useLLMCopyVariation ? provider.id : 'template');
            })
        );
    }
}

function zoneToPosition(zone: string, align: string) {
    const y = zone === 'top' ? 80 : zone === 'center' ? 480 : 880;
    const x = align === 'left' ? 80 : align === 'center' ? 540 : 900;
    return { x, y };
}

function buildCopyPrompt(punchlines: PunchlineSet, pattern: Pattern): string {
    const slots = Object.entries(punchlines)
        .filter(([k, v]) => k !== 'contentType' && v)
        .map(([k, v]) => `  - ${k}: "${v}"`)
        .join('\n');

    return (
        `You are a creative ad copywriter. Generate improved, engaging copy for a "${punchlines.contentType}" advertisement.\n` +
        `Style direction: ${pattern.promptHints ?? pattern.description}\n\n` +
        `Current copy slots:\n${slots}\n\n` +
        `Return improved text for each slot. Keep values short and punchy (headline max 8 words, cta max 4 words).`
    );
}

/**
 * Deep-merges LLM text copy into existing text elements by slot ID.
 * Only updates `content` — position, style, layer are all preserved from the original pattern.
 */
function mergeWithCopyVariations(
    elements: DesignJSON['elements'],
    variations: Record<string, string>
): DesignJSON['elements'] {
    return elements.map(el => {
        if (el.type === 'text' && el.id in variations) {
            return { ...el, content: variations[el.id] };
        }
        return el;
    }) as DesignJSON['elements'];
}
