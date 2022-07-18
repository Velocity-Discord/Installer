import { writable } from "svelte/store";
const path = require("path");
const electron = require("electron");

export const savedPath = writable();
export const velocityPath = writable();
export const finished = writable(false);
export const installing = writable(false);

(async () => {
    velocityPath.set(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
})();
