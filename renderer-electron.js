const remote = require("electron").remote;
const { shell } = require("electron");
const { app, dialog, BrowserWindow } = remote;
const { writeFile } = require("fs");
const { isMac } = require("./util");

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = (event) => {
  if (document.readyState == "complete") {
    handleWindowControls();
  }
};

window.onbeforeunload = (event) => {
  /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
  win.removeAllListeners();
};

function handleWindowControls() {
  // menubar class settings
  const rootMenuItems = document.querySelectorAll("#menubar > ul > li");
  for (let li of rootMenuItems) {
    li.addEventListener("click", (e) => {
      document.querySelector("#menubar > ul").classList.toggle("opened");
    });
  }

  // Make minimise/maximise/restore/close buttons work when they are clicked
  win.maxUnmaxWindow = function (maximize) {
    if (maximize) {
      // sysbtncls.add("maximized2");

      if (isMac) this.setFullScreen(true);
      else this.maximize();
    } else {
      // sysbtncls.remove("maximized2");

      if (isMac) this.setFullScreen(false);
      else this.unmaximize();
    }
  }.bind(win);

  const sysbtncls = document.getElementById("sys-btns").classList;
  if (isMac) {
    win.on("leave-full-screen", () => {
      sysbtncls.remove("maximized2");
    });
    win.on("enter-full-screen", () => {
      sysbtncls.add("maximized2");
    });
  } else {
    win.on("maximize", () => {
      sysbtncls.add("maximized2");
    });
    win.on("unmaximize", () => {
      sysbtncls.remove("maximized2");
    });
  }

  win.minimize2 = function () {
    if (this.isFullScreen()) {
      this.maxUnmaxWindow(false);
      this.once("leave-full-screen", () => this.minimize());
    } else {
      this.minimize();
    }
  }.bind(win);

  win.maximize2 = function () {
    if (isMac) {
      this.isMaximized() ? this.unmaximize() : this.maximize();
      if (this.isFullScreen()) this.maxUnmaxWindow(false);
    } else {
      this.maxUnmaxWindow(this.isMaximized() == false);
    }
  }.bind(win);

  document.querySelector("#drag-region").addEventListener("dblclick", () => {
    win.maximize2();
  });

  document.getElementById("min-button").addEventListener("click", (event) => {
    win.minimize2();
  });

  document.getElementById("max-button").addEventListener("click", (event) => {
    win.maxUnmaxWindow(true);
  });

  document
    .getElementById("restore-button")
    .addEventListener("click", (event) => {
      win.maxUnmaxWindow(false);
    });

  document.getElementById("close-button").addEventListener("click", (event) => {
    win.close();
  });

  // set initial maxUnmax button visiblity
  if (win.isFullScreen() || (win.isMaximized() && !isMac)) {
    sysbtncls.add("maximized2");
  } else {
    sysbtncls.remove("maximized2");
  }
}

// menu handler
const { delegate } = require("./util");
const { fullscreenScreenshot, getDesktopStream } = require("./screenshot");
const { notifyMe } = require("./notification");

const menubar = document.querySelector("#menubar > ul");
delegate(menubar, "li", "click", async (e) => {
  console.log(e.target.innerText);
  switch (e.target.innerText) {
    case "Logo Design":
    case "Card Design":
    case "Poster Design":
      e.target.classList.toggle("checked");
      break;
    case "Show Notification":
      notifyMe(e.target.innerText);
      break;
    case "Full screenshot":
      fullscreenScreenshot(null, "image/jpeg");
      // fullscreenScreenshot(function (base64data) {
      //     document.getElementById("my-preview").setAttribute("src", base64data);
      // }, "image/png");
      break;
    case "App screenshot":
      break;
    case "Open Data Folder":
      // shell.openExternal('https://github.com');
      console.log("userData=", app.getPath("userData"));
      shell.openExternal("file://" + app.getPath("userData"));
      //shell.openItem(app.getPath("userData"));
      break;
    case "Exit":
      win.close();
      break;
    case "Stop Desktop Stream":
      {
        const uTube = document.getElementById("youTubePlayer1");
        const video = document.getElementById("video-main");
        if (video.srcObject) {
          video.srcObject.getTracks()[0].stop();
          video.srcObject = null;
        }
        doMediaRecorder(false, null); // stop.
        e.target.innerText = "Start Desktop Stream";
        video.style.display = "none";
        uTube.style.display = "block";
      }
      break;
    case "Start Desktop Stream":
      {
        e.target.innerText = "Stop Desktop Stream";
        const uTube = document.getElementById("youTubePlayer1");
        const video = document.getElementById("video-main");
        //console.assert(video.srcObject === null);

        let stream = await getDesktopStream("Screen 2");
        if (!stream) stream = await getDesktopStream("Screen 1");
        if (!stream) stream = await getDesktopStream("Entire Screen");
        console.log(video.src);
        console.log(video.srcObject);

        // video.onloadedmetadata = function () { video.play(); }
        video.srcObject = stream;
        console.log(stream);
        console.log(video.src);
        video.play();
        //setTimeout(() => video.pause(), 300);
        doMediaRecorder(true, stream);
        video.style.display = "block";
        uTube.style.display = "none";
      }
      break;
    case "Release Notes#":
      popup1();
      break;
    default:
      console.warn("Not handled:" + e.target.innerText);
      break;
  }
  //menubar.classList.toggle("opened");
});

// recorder
let mediaRecorder = null;
function doMediaRecorder(start, stream) {
  return;
  if (mediaRecorder && !start) {
    console.log("stop record");
    mediaRecorder.stop();
    //mediaRecorder = null;
  }
  // Create the Media Recorder
  if (start) {
    console.log("start record");
    const options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = (e) => {
      console.log("video data available");
      recordedChunks.push(e.data);
    };

    // call   mediaRecorder.stop();
    mediaRecorder.onstop = async (e) => {
      const blob = new Blob(recordedChunks, {
        type: "video/webm; codecs=vp9",
      });

      const buffer = Buffer.from(await blob.arrayBuffer());

      const { filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save video",
        defaultPath: `vid-${Date.now()}.webm`,
      });

      if (filePath) {
        writeFile(filePath, buffer, () =>
          console.log("video saved successfully!")
        );
      }

      mediaRecorder = null;
    };
  }
}

var newWindow = null;
function popup1() {
  if (newWindow) {
    newWindow.focus();
    return;
  }

  newWindow = new BrowserWindow({
    height: 800,
    width: 600,
    title: "",
    minimizable: false,
    fullscreenable: false,
  });

  newWindow.loadURL("file://" + __dirname + "/profile.html");

  newWindow.on("closed", function () {
    newWindow = null;
  });
}
