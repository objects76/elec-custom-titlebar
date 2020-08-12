const { app, BrowserWindow } = require("electron");
const settings = require("./electron-settings");

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
		frame: false,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	if (isDev) {
		mainWindow.loadURL("http://localhost:5501/"); // with live server.
	} else mainWindow.loadFile("index.html");

	settings.loadWindowSettings(mainWindow, "main");
	mainWindow.on("close", () => {
		settings.saveWindowSettings(mainWindow, "main");
	});
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
	mainWindow.once("ready-to-show", () => mainWindow.show());
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", function () {
	if (mainWindow === null) {
		createWindow();
	}
});
