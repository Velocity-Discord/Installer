import { writable } from "svelte/store";

export const forward = writable(false)
export const backward = writable(false)
export const location = writable("/1")
export const next = writable("/2");
export const state = { direction: 1 };
export const action = writable("Next")