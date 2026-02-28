import { DesignJSON } from './design-json';

export class Composition {
    public readonly id: string;
    public name: string;
    public design: DesignJSON;
    public generatedBy: string;
    public createdAt: Date;

    constructor(name: string, design: DesignJSON, generatedBy: string = 'manual') {
        this.id = crypto.randomUUID();
        this.name = name;
        this.design = design;
        this.generatedBy = generatedBy;
        this.createdAt = new Date();
    }
}
