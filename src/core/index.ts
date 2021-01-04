import { app, BrowserWindow } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

const DEVELOPMENT = "dev";

function createWindow(): void {
    mainWindow = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.menuBarVisible = false;

    // Fixes Node fs issues as seen here https://github.com/electron/electron/issues/22119
    app.allowRendererProcessReuse = false;

    mainWindow.maximize();

    // Check if in development environment
    if (process.env.ENV === DEVELOPMENT) {
        mainWindow.loadURL("http://localhost:9102");
    } else {
        mainWindow.loadFile(path.join(__dirname, "../../dist/app/index.html"));
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length == 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
