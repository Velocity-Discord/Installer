const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

const isDevelopment = process.env.NODE_ENV !== "production";
app.name = "Velocity";

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 630,
        height: 400,
        resizable: false,
        titleBarStyle: "hidden",
        backgroundColor: "#040404",
        fullscreenable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    mainWindow.webContents.on("new-window", (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../public/index.html"));
};

ipcMain.handle("getAppPath", () => app.getPath("appData"));

ipcMain.handle("kill", async (e) => {
    app.quit();
});

ipcMain.handle("getpath", async () => {
    let d = await dialog.showOpenDialog({ properties: ["openDirectory", "treatPackageAsDirectory"] });

    return d;
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    app.quit();
});
