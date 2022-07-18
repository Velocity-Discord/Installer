import { writable } from "svelte/store";

export const fileLogs = writable([]);
export const installLogs = writable([]);

export function logNewLine(type, entry) {
    type.update((a) => {
        a.push(entry);
        return a;
    });
}

export function clearAllLogs(type) {
    type.set([]);
}

export let abc = writable(false);
