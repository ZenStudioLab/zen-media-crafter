import { DesignJSON } from '@/core/entities/design-json';

export interface IRenderingEngine {
    render(design: DesignJSON): Promise<string | Buffer>;
}
