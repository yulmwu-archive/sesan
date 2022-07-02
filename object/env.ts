import { LangObject } from "./object";

export default class Enviroment {
    public store: Map<string, LangObject> = new Map<string, LangObject>();
    public outer: Enviroment | null = null;

    public get(name: string): LangObject | null {
        const value = this.store.get(name);
        if (!value) {
            if (this.outer) return this.outer.get(name);
        }
        return null;
    }

    public set(name: string, value: LangObject): void {
        this.store.set(name, value);
    }
}

export const newEnclosedEnvironment = (outer: Enviroment): Enviroment => {
    const env = new Enviroment();
    env.outer = outer;
    return env;
};
