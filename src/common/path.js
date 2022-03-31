const { ipcRenderer } = require("electron");
const { dialog } = require("@electron/remote");
const fs = require("fs");
const path = require("path");

let appPath;

export async function getPath({ sprops }) {
    const statusProps = sprops
    const d = await ipcRenderer.invoke("getpath");
    if (d.canceled || !d.filePaths[0]) return;

    let proposedPath = d.filePaths[0];
    const selected = path.basename(proposedPath);
    let channelName;
    if (proposedPath.toLowerCase().includes("canary")) channelName = "Discord Canary";
    else if (proposedPath.toLowerCase().includes("ptb")) channelName = "Discord PTB";
    else channelName = "Discord";

    if (process.platform == "win32") {
        const isBaseDir = selected === channelName;
        if (isBaseDir) {
            const version = fs
                .readdirSync(proposedPath)
                .filter((f) => fs.lstatSync(path.join(proposedPath, f)).isDirectory() && f.split(".").length > 1)
                .sort()
                .reverse()[0];
            if (!version) return "";
            appPath = path.join(proposedPath, version, "resources");
        } else if (selected.startsWith("app-") && selected.split(".").length > 2) appPath = path.join(proposedPath, "resources");
        else if (selected === "resources") appPath = proposedPath;
        else appPath = proposedPath;
    }

    if (process.platform == "darwin") {
        if (selected === `${channelName}.app`) appPath = path.join(proposedPath, "Contents", "Resources");
        else if (selected === "Contents") appPath = path.join(proposedPath, "Resources");
        else if (selected === "Resources") appPath = proposedPath;
        else appPath = proposedPath;
    } else appPath = proposedPath;

    window.appPath = appPath

    return appPath;
}

