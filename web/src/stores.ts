import { writable } from 'svelte/store';
import type { IResults } from './types';

export let evaluating = writable(false);
export let errors = writable(0);
export let results = writable<IResults>({
    result: [],
    errors: [],
    ast: '',
});
export let ast = writable('');
export let toggleSidebar = writable(false);
