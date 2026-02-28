import { DesignJSON } from './design-json';

export class Composition {
    public readonly id: string;
    public name: string;
    public designJson: DesignJSON;
    public generatedBy: string;
    public createdAt: Date;

    constructor(name: string, designJson: DesignJSON, generatedBy: string = 'manual') {
        this.id = crypto.randomUUID();
        this.name = name;
        this.designJson = designJson;
        this.generatedBy = generatedBy;
        this.createdAt = new Date();
    }
}
