const fs = require("fs")
const path = require("path");

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

export async function startInstall() {
    function killInstall(err) {
        failed.set(true)
        forward.set(true)
        action.set("Exit")
        logNewLine(installLogs, `❌ INSTALL FAILED: ${err}`);
    }

    await waitUntil(() => window.appPath);

    // Timeouts just make it look... better
    setTimeout(() => {
        logNewLine(installLogs, `\n\n Starting Install`);

        let oldInstall = fs.existsSync(path.join(window.appPath, "app"));
        if (oldInstall) {
            logNewLine(installLogs, `Old Client Mod Install detected ${window.appPath}/app`);
            setTimeout(() => {
                logNewLine(installLogs, "Proceeding to rename dirs...");
                progress.set(10);
            }, 700);
        }
        setTimeout(() => {
            killInstall("Exited install with err code 0");
            logNewLine(installLogs, "The Velocity Project is in Alpha Testing. \n Our Installer will not function until Public Beta Testing commences.")
            logNewLine(installLogs, "Thank you for using Velocity.")
            progress.set(28);
        }, 1300);
    }, 500);
}
