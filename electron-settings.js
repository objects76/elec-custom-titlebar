const path = require("path");
const { isMac } = require("./util");

function setElectronDir(appName) {
  const { app } = require("electron");
  const baseDir = path.join(app.getPath("documents"), appName);
  const logDir = path.join(baseDir, "logs");
  app.setPath("userData", baseDir);
  app.setPath("logs", logDir);
  console.log("set basedir:", baseDir);
}

let settings;
if (settings === undefined) {
  settings = require("electron-settings");

  const appName = "seamless-titlebar";
  settings.configure({
    numSpaces: 4,
    prettify: true,
  });

  setElectronDir(appName);
}

module.exports = settings;

// windows settings
module.exports.loadWindowSettings = function (mainWindow, winName) {
  if (settings.getSync(winName + "-devtool"))
    mainWindow.webContents.openDevTools();
  mainWindow.setBounds(settings.getSync(winName + "-bounds"));

  if (settings.getSync(winName + "-fullscreen")) mainWindow.setFullScreen(true);
  if (settings.getSync(winName + "-maximized")) mainWindow.maximize();
};

module.exports.saveWindowSettings = function (mainWindow, winName) {
  settings.setSync(winName + "-devtool", mainWindow.isDevToolsOpened());
  settings.setSync(winName + "-maximized", mainWindow.isMaximized());
  settings.setSync(winName + "-fullscreen", mainWindow.isFullScreen());

  if (mainWindow.isNormal())
    settings.setSync(winName + "-bounds", mainWindow.getBounds());
};
