import { LangObject } from '../../index';

export default class Enviroment {
    public store: Map<string, LangObject> = new Map<string, LangObject>();
    public outer: Enviroment | null = null;

    constructor(outer: Enviroment | null = null) {
        this.outer = outer;
    }

    public get(name: string): LangObject | null {
        const value = this.store.get(name);

        if (value) return value;
        if (this.outer) return this.outer.get(name);

        return null;
    }

    public set(name: string, value: LangObject) {
        this.store.set(name, value);
    }

    public delete(name: string) {
        this.store.delete(name);
    }

    public update(name: string, value: LangObject) {
        if (this.store.has(name)) this.store.set(name, value);
        else if (this.outer) this.outer.update(name, value);
    }

    public has(name: string): boolean {
        return this.store.has(name) ?? (this.outer && this.outer.has(name));
    }
}
