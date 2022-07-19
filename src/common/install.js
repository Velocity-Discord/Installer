const fs = require("fs");
const fsPromises = require("fs/promises");
const originalFs = require("original-fs").promises;
const path = require("path");
const https = require("https");
const electron = require("electron");

import { fileLogs, installLogs, logNewLine } from "../stores/logs";
import { savedPath } from "../stores/path";
import { progress, failed } from "../stores/progress";
import { forward, backward, next, location, action } from "../stores/locations";
import { actionType } from "../stores/action";

let aType;

actionType.subscribe((action) => {
    aType = action;
    console.log(action);
});

console.log({ aType, actionType });

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function waitUntil(condition) {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
}

const getAsarData = async () => {
    return new Promise((resolve, reject) => {
        let url = "https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/dist/velocity.asar";
        let body = [];

        https.get(url, (res) => {
            res.on("data", (d) => {
                body.push(d);
            });

            res.on("end", () => {
                const data = Buffer.concat(body);
                resolve(data);
            });

            res.on("error", (err) => {
                reject(err);
            });
        });
    });
};

const getPackageData = async () => {
    return new Promise((resolve, reject) => {
        let url = "https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/package.json";
        let body;

        https.get(url, (res) => {
            let rawData = "";

            res.on("data", (chunk) => {
                rawData += chunk;
            });

            res.on("end", () => {
                body = rawData;

                resolve(body);
            });

            res.on("error", (err) => {
                reject(err);
            });
        });
    });
};

export async function startInstall() {
    function killInstall(err) {
        failed.set(true);
        forward.set(true);
        action.set("Exit");
        logNewLine(installLogs, `❌ INSTALL FAILED: ${err}`);
    }

    function finishInstall() {
        logNewLine(installLogs, "✅ Velocity successfully installed");
        forward.set(true);
        progress.set(100);
        action.set("Exit");
    }

    function finishUninstall() {
        logNewLine(installLogs, "✅ Velocity successfully uninstalled");
        forward.set(true);
        progress.set(100);
        action.set("Exit");
    }

    await waitUntil(() => window.appPath);

    let oldInstall = fs.existsSync(path.join(window.appPath, "app"));

    console.log(aType, aType == 2);
    if (aType === 2) {
        console.log("e");
        if (oldInstall) {
            console.log("a");
            logNewLine(installLogs, "Velocity install found");
            logNewLine(installLogs, "Removing old install...");
            progress.set(60);

            await fsPromises.unlink(path.join(window.appPath, "app/index.js"));
            await fsPromises.unlink(path.join(window.appPath, "app/package.json"));
            await fsPromises.rmdir(path.join(window.appPath, "app"));

            logNewLine(installLogs, "✅ Old install successfully removed");
            return finishUninstall();
        }
        return;
    }

    logNewLine(installLogs, `\n\n Starting Install`);

    if (oldInstall) {
        try {
            logNewLine(installLogs, `Old Client Modification detected ${window.appPath}/app`);
            logNewLine(installLogs, "Proceeding to replace...");
            progress.set(10);

            await fsPromises.unlink(path.join(window.appPath, "app/index.js"));
            await fsPromises.unlink(path.join(window.appPath, "app/package.json"));
            await fsPromises.rmdir(path.join(window.appPath, "app"));

            logNewLine(installLogs, "✅ Old Client Modification successfully removed");
            logNewLine(installLogs, "Fetching latest remote package.json...");

            const packageToWrite = await getPackageData();

            logNewLine(installLogs, "✅ Remote package.json successfully fetched");
            progress.set(20);
            logNewLine(installLogs, "Fetching latest remote asar...");

            logNewLine(installLogs, "✅ Remote package.json successfully fetched");
            progress.set(25);
            logNewLine(installLogs, "Writing package.json to disk");

            if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"))) {
                await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
            }
            if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"))) {
                await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"));
            }
            await fsPromises.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"), packageToWrite);

            logNewLine(installLogs, "✅ package.json successfully written to disk");
            progress.set(35);
            logNewLine(installLogs, "Writing asar to disk");

            await originalFs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"), await getAsarData());

            logNewLine(installLogs, "✅ asar successfully written to disk");
            progress.set(45);

            const VelocityDiscordPath = path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord");

            logNewLine(installLogs, "Creating files in Discord folder...");

            await fsPromises.mkdir(path.join(window.appPath, "app"));
            progress.set(50);
            await fsPromises.writeFile(path.join(window.appPath, "app/index.js"), `require("${VelocityDiscordPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}");`);
            progress.set(55);
            await fsPromises.writeFile(path.join(window.appPath, "app/package.json"), `{"name":"velocity", "main":"./index.js"}`);
            progress.set(60);

            finishInstall();
        } catch (err) {
            killInstall(err);
        }
    } else {
        try {
            progress.set(10);

            logNewLine(installLogs, "Fetching latest remote package.json...");

            const packageToWrite = await getPackageData();

            logNewLine(installLogs, "✅ Remote package.json successfully fetched");
            progress.set(20);
            logNewLine(installLogs, "Fetching latest remote asar...");

            const asarToWrite = await getAsarData();

            logNewLine(installLogs, "✅ Remote package.json successfully fetched");
            progress.set(25);
            logNewLine(installLogs, "Writing package.json to disk");

            if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"))) {
                await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
            }
            if (!fs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"))) {
                await fsPromises.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"));
            }
            await fsPromises.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"), packageToWrite);

            logNewLine(installLogs, "✅ package.json successfully written to disk");
            progress.set(35);
            logNewLine(installLogs, "Writing asar to disk");

            await originalFs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"), asarToWrite, { encoding: "binary" });

            logNewLine(installLogs, "✅ asar successfully written to disk");
            progress.set(45);

            const VelocityDiscordPath = path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord");

            logNewLine(installLogs, "Creating files in Discord folder...");

            await fsPromises.mkdir(path.join(window.appPath, "app"));
            progress.set(50);
            await fsPromises.writeFile(path.join(window.appPath, "app/index.js"), `require("${VelocityDiscordPath}")`);
            progress.set(55);
            await fsPromises.writeFile(path.join(window.appPath, "app/package.json"), `{"name":"velocity", "main":"./index.js"}`);
            progress.set(60);

            logNewLine(installLogs, "✅ files successfully created");
            progress.set(80);

            finishInstall();
        } catch (err) {
            killInstall(err);
        }
    }
}
