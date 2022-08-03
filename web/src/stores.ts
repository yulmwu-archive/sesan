import { writable } from 'svelte/store';
import type { IResults } from './types';

let evaluating = writable(false);
let errors = writable(0);
let results = writable<IResults>({
    result: [],
    errors: [],
    ast: '',
});
let ast = writable('');

export { evaluating, errors, results, ast };
