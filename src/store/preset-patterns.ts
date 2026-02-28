import { Pattern } from '../core/entities/pattern';

export const presetPatterns: Pattern[] = [
    {
        id: 'preset-noir',
        name: 'Neon Noir',
        description: 'Dark, edgy layout with strong contrast and neon accents.',
        tags: ['dark', 'cyberpunk', 'gaming', 'tech'],
        background: { type: 'solid', value: '#0d1117', overlayOpacity: 0.8 },
        accentColor: '#00f5d4', // neon teal
        textSlots: [
            { id: 'headline', zone: 'center', align: 'center', fontFamily: 'Inter', fontSizeScale: 1.5, color: '#ffffff', fontWeight: 'extrabold' },
            { id: 'subheadline', zone: 'bottom', align: 'center', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#00f5d4', fontWeight: 'bold' },
            { id: 'cta', zone: 'bottom', align: 'center', fontFamily: 'Inter', fontSizeScale: 0.7, color: '#ffffff', fontWeight: 'bold' },
            { id: 'caption', zone: 'top', align: 'center', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#8b949e', fontWeight: 'normal' }
        ],
        promptHints: 'Dark background, cyberpunk vibes, sharp edges.'
    },
    {
        id: 'preset-minimalist',
        name: 'Clean Minimalist',
        description: 'Light, airy layout focusing on whitespace and clarity.',
        tags: ['light', 'clean', 'corporate', 'elegant'],
        background: { type: 'solid', value: '#ffffff', overlayOpacity: 0.4 },
        accentColor: '#000000',
        textSlots: [
            { id: 'headline', zone: 'top', align: 'left', fontFamily: 'Playfair Display', fontSizeScale: 1.8, color: '#111827', fontWeight: 'bold' },
            { id: 'subheadline', zone: 'center', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.9, color: '#4b5563', fontWeight: 'normal' },
            { id: 'cta', zone: 'bottom', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#111827', fontWeight: 'bold' },
            { id: 'caption', zone: 'bottom', align: 'right', fontFamily: 'Inter', fontSizeScale: 0.6, color: '#9ca3af', fontWeight: 'normal' }
        ],
        promptHints: 'Minimalist white space, luxury feel, sophisticated typography.'
    },
    {
        id: 'preset-bold-pop',
        name: 'Bold Pop',
        description: 'Vibrant, high-energy layout designed to stop the scroll.',
        tags: ['vibrant', 'loud', 'social', 'sale'],
        background: { type: 'gradient', value: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', overlayOpacity: 0.6 },
        accentColor: '#FFE66D', // bright yellow
        textSlots: [
            { id: 'headline', zone: 'center', align: 'center', fontFamily: 'Impact', fontSizeScale: 2.5, color: '#ffffff', fontWeight: 'extrabold' },
            { id: 'subheadline', zone: 'top', align: 'center', fontFamily: 'Inter', fontSizeScale: 1.0, color: '#FFE66D', fontWeight: 'bold' },
            { id: 'cta', zone: 'bottom', align: 'center', fontFamily: 'Inter', fontSizeScale: 1.2, color: '#111827', fontWeight: 'extrabold' }, // Dark text on light button implicitly
            { id: 'caption', zone: 'bottom', align: 'center', fontFamily: 'Inter', fontSizeScale: 0.7, color: '#ffffff', fontWeight: 'normal' }
        ],
        promptHints: 'Loud, vibrant colors, pop-art style, highly energetic.'
    },
    {
        id: 'preset-classic-meme',
        name: 'Classic Meme',
        description: 'Standard top/bottom text meme format with a subtle backdrop.',
        tags: ['meme', 'funny', 'casual', 'social'],
        background: { type: 'solid', value: '#000000', overlayOpacity: 0.2 }, // Very light overlay to let image pop
        accentColor: '#ffffff',
        textSlots: [
            { id: 'headline', zone: 'top', align: 'center', fontFamily: 'Impact', fontSizeScale: 2.0, color: '#ffffff', fontWeight: 'extrabold' },
            { id: 'caption', zone: 'bottom', align: 'center', fontFamily: 'Impact', fontSizeScale: 2.0, color: '#ffffff', fontWeight: 'extrabold' }
        ],
        promptHints: 'Classic internet meme format, top and bottom text.'
    },
    {
        id: 'preset-elegant-promo',
        name: 'Elegant Promo',
        description: 'Sophisticated layout perfect for fashion or high-end products.',
        tags: ['luxury', 'fashion', 'promo', 'elegant'],
        background: { type: 'gradient', value: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)', overlayOpacity: 0.9 }, // Vignette effect
        accentColor: '#D4AF37', // Gold
        textSlots: [
            { id: 'headline', zone: 'bottom', align: 'center', fontFamily: 'Playfair Display', fontSizeScale: 1.6, color: '#ffffff', fontWeight: 'bold' },
            { id: 'subheadline', zone: 'bottom', align: 'center', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#D4AF37', fontWeight: 'normal' },
            { id: 'cta', zone: 'center', align: 'center', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#ffffff', fontWeight: 'bold' }
        ],
        promptHints: 'Luxury fashion promo, moody lighting, gold accents.'
    },
    {
        id: 'preset-tech-startup',
        name: 'Tech Startup',
        description: 'Modern, clean layout with a slight corporate edge.',
        tags: ['tech', 'b2b', 'corporate', 'modern'],
        background: { type: 'solid', value: '#F3F4F6', overlayOpacity: 0.7 }, // Light gray
        accentColor: '#3B82F6', // Blue
        textSlots: [
            { id: 'headline', zone: 'center', align: 'left', fontFamily: 'Inter', fontSizeScale: 1.4, color: '#1F2937', fontWeight: 'extrabold' },
            { id: 'subheadline', zone: 'center', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.9, color: '#4B5563', fontWeight: 'normal' },
            { id: 'cta', zone: 'bottom', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.9, color: '#ffffff', fontWeight: 'bold' }, // White text for blue btn
            { id: 'caption', zone: 'top', align: 'right', fontFamily: 'Inter', fontSizeScale: 0.7, color: '#9CA3AF', fontWeight: 'bold' }
        ],
        promptHints: 'B2B tech startup style, modern, clean, trustworthy.'
    }
];
