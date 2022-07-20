import { writable } from 'svelte/store';

export let currentLine = writable(0);
export let currentColumn = writable(0);
