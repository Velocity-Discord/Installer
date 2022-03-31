import { writable } from "svelte/store";

export const savedPath = writable();
export const finished = writable(false)
export const installing = writable(false)