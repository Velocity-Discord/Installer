const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

require("@electron/remote/main").initialize();

const isDevelopment = process.env.NODE_ENV !== "production";
app.name = "Velocity";

const createWindow = () => {
  // Create the browser window.
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

  require("@electron/remote/main").enable(mainWindow.webContents);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));
};

ipcMain.handle("getpath", async () => {
  let d = await dialog.showOpenDialog({ properties: ["openDirectory", "treatPackageAsDirectory"] });

  return d
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// if (isDevelopment) {
//     require("electron-reload")(__dirname, {
//         electron: path.join(__dirname, "../node_modules", ".bin", "electron"),
//         awaitWriteFinish: true,
//     });
// }

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
