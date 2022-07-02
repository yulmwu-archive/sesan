export default class Enviroment {
    public store: Map<string, Object> = new Map<string, Object>();
    public outer: Enviroment | null = null;

    public get(name: string): Object | null {
        const value = this.store.get(name);
        if (!value) {
            if (this.outer) return this.outer.get(name);
        }
        return null;
    }

    public set(name: string, value: Object): void {
        this.store.set(name, value);
    }
}
