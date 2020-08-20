import { writable, Writable } from 'svelte/store';

export const selectedTasks: Writable<string[]> = writable([]);