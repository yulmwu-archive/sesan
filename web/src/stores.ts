import { writable } from 'svelte/store';
import type { IResults } from './types';

let currentLine = writable(1);
let currentColumn = writable(0);
let evaluating = writable(false);
let errors = writable(0);
let results = writable<IResults>({
    result: [],
    errors: [],
});

export { currentLine, currentColumn, evaluating, errors, results };
