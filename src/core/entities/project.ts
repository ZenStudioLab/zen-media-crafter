import { Composition } from './composition';

export class Project {
    public readonly id: string;
    public name: string;
    public compositions: Composition[];
    public createdAt: Date;
    public updatedAt: Date;

    constructor(name: string) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.compositions = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public addComposition(composition: Composition): void {
        this.compositions.push(composition);
        this.updatedAt = new Date();
    }

    public removeComposition(id: string): void {
        this.compositions = this.compositions.filter(c => c.id !== id);
        this.updatedAt = new Date();
    }
}
