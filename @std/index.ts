import { readdirSync, readFileSync } from 'fs';

export default readdirSync('./').filter((x) => x.endsWith('.tiny'));

const content = (x: string): string => readFileSync(`./${x}.tiny`, 'utf8');

export const stds = {
    'io.ts': content('io'),
    'array.ts': content('array'),
    'util.ts': content('util'),
    'lib.ts': content('lib'),
};
