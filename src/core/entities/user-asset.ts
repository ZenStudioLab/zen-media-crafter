import { z } from 'zod';

export const UserAssetSchema = z.object({
    id: z.string(),
    name: z.string(),
    blobUrl: z.string(),
    width: z.number(),
    height: z.number(),
});

export type UserAsset = z.infer<typeof UserAssetSchema>;
