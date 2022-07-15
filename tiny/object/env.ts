import { LangObject } from './object';

export default class Enviroment {
    public store: Map<string, LangObject> = new Map<string, LangObject>();
    public outer: Enviroment | null = null;

    public get(name: string): LangObject | null {
        const value = this.store.get(name);
        if (!value) {
            if (this.outer) return this.outer.get(name);
            return null;
        }
        return value;
    }

    public set(name: string, value: LangObject) {
        this.store.set(name, value);
    }

    public delete(name: string) {
        this.store.delete(name);
    }

    public update(name: string, value: LangObject) {
        if (this.store.has(name)) {
            this.store.set(name, value);
        } else {
            if (this.outer) this.outer.update(name, value);
        }
    }
}

export const newEnclosedEnvironment = (outer: Enviroment): Enviroment => {
    const env = new Enviroment();
    env.outer = outer;
    return env;
};
