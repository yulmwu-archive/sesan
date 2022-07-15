import { readdirSync, readFileSync } from 'fs';

export default readdirSync('./').filter((x) => x.endsWith('.tiny'));

const content = (x: string): string => readFileSync(`./${x}.tiny`, 'utf8');

export const stds = {
    'io.ts': content('@std/io'),
    'array.ts': content('@std/array'),
    'util.ts': content('@std/decorator'),
    'lib.ts': content('@std/builtin'),
};
