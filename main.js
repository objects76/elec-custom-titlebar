const { app, BrowserWindow } = require("electron");
const settings = require("./electron-settings");
const { isMac } = require("./util");
const isDev = process.env.NODE_ENV === "dev";

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // alwaysOnTop: true,
    width: 800,
    height: 600,
    minWidth: 480,
    minHeight: 300,
    frame: isMac ? true : false,
    //frame: false,
    titleBarStyle: "hidden",
    frame: false,

    show: false,
    //allowRendererProcessReuse: true,
    webPreferences: {
      nodeIntegration: true,
    },
    backgroundColor: "#000000",
    //transparent: true,
    // mac
    fullscreenable: true,
    // simpleFullscreen: true,
    //titleBarStyle: "hiddenInset",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:4500/"); // with live server.
  } else mainWindow.loadFile("index.html");

  mainWindow.on("close", () => {
    settings.saveWindowSettings(mainWindow, "main");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    settings.loadWindowSettings(mainWindow, "main");
    mainWindow.show();
  });
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin" || isDev) app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
