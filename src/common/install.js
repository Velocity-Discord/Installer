const fs = require("fs/promises");
const originalFs = require("fs");
const actualOriginalFs = require("original-fs").promises;
const path = require("path");
const https = require("https");
const electron = require("electron");

import { fileLogs, installLogs, logNewLine } from "../stores/logs";
import { savedPath } from "../stores/path";
import { progress, failed } from "../stores/progress";
import { forward, backward, next, location, action } from "../stores/locations";

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function waitUntil(condition) {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
}

const getAsarData = async () => {
    return new Promise((resolve, reject) => {
        let url = "https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/dist/velocity.asar";
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

    await waitUntil(() => window.appPath);

    logNewLine(installLogs, `\n\n Starting Install`);

    let oldInstall = originalFs.existsSync(path.join(window.appPath, "app"));
    if (oldInstall) {
        try {
            logNewLine(installLogs, `Old Client Modification detected ${window.appPath}/app`);
            logNewLine(installLogs, "Proceeding to replace...");
            progress.set(10);

            await fs.unlink(path.join(window.appPath, "app/index.js"));
            await fs.unlink(path.join(window.appPath, "app/package.json"));
            await fs.rmdir(path.join(window.appPath, "app"));

            logNewLine(installLogs, "✅ Old Client Modification successfully removed");
            logNewLine(installLogs, "Fetching latest remote package.json...");

            const packageToWrite = await getPackageData();

            logNewLine(installLogs, "✅ Remote package.json successfully fetched");
            progress.set(20);
            logNewLine(installLogs, "Fetching latest remote asar...");

            const asarToWrite = await getAsarData();

            logNewLine(installLogs, "✅ Remote package.json successfully fetched");
            progress.set(25);
            logNewLine(installLogs, "Writing package.json to disk");

            if (!originalFs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"))) {
                await fs.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
            }
            if (!originalFs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"))) {
                await fs.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"));
            }
            await fs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"), packageToWrite);

            logNewLine(installLogs, "✅ package.json successfully written to disk");
            progress.set(35);
            logNewLine(installLogs, "Writing asar to disk");

            await actualOriginalFs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"), asarToWrite);

            logNewLine(installLogs, "✅ asar successfully written to disk");
            progress.set(45);

            const VelocityDiscordPath = path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord");

            logNewLine(installLogs, "Creating files in Discord folder...");

            await fs.mkdir(path.join(window.appPath, "app"));
            progress.set(50);
            await fs.writeFile(path.join(window.appPath, "app/index.js"), `require("${VelocityDiscordPath}")`);
            progress.set(55);
            await fs.writeFile(path.join(window.appPath, "app/package.json"), `{"name":"velocity", "main":"./index.js"}`);
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

            if (!originalFs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"))) {
                await fs.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord"));
            }
            if (!originalFs.existsSync(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"))) {
                await fs.mkdir(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord", "dist"));
            }
            await fs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"), packageToWrite);

            logNewLine(installLogs, "✅ package.json successfully written to disk");
            progress.set(35);
            logNewLine(installLogs, "Writing asar to disk");

            await actualOriginalFs.writeFile(path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"), asarToWrite);

            logNewLine(installLogs, "✅ asar successfully written to disk");
            progress.set(45);

            const VelocityDiscordPath = path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord");

            logNewLine(installLogs, "Creating files in Discord folder...");

            await fs.mkdir(path.join(window.appPath, "app"));
            progress.set(50);
            await fs.writeFile(path.join(window.appPath, "app/index.js"), `require("${VelocityDiscordPath}")`);
            progress.set(55);
            await fs.writeFile(path.join(window.appPath, "app/package.json"), `{"name":"velocity", "main":"./index.js"}`);
            progress.set(60);

            finishInstall();
        } catch (err) {
            killInstall(err);
        }
    }
}
