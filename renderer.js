const remote = require("electron").remote;
const { shell } = require("electron");
const { app, dialog } = remote;
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
  document.getElementById("min-button").addEventListener("click", (event) => {
    win.minimize();
  });

  document.getElementById("max-button").addEventListener("click", (event) => {
    if (isMac) win.setFullScreen(true);
    else win.maximize();
  });

  document
    .getElementById("restore-button")
    .addEventListener("click", (event) => {
      if (isMac) win.setFullScreen(false);
      else win.unmaximize();
    });

  document.getElementById("close-button").addEventListener("click", (event) => {
    win.close();
  });

  // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
  toggleMaxRestoreButtons();
  if (isMac) {
    win.on("enter-full-screen", toggleMaxRestoreButtons);
    win.on("leave-full-screen", toggleMaxRestoreButtons);
  } else {
    win.on("maximize", toggleMaxRestoreButtons);
    win.on("unmaximize", toggleMaxRestoreButtons);
  }

  function toggleMaxRestoreButtons() {
    if (win.isMaximized() || win.isFullScreen()) {
      document.body.classList.add("maximized");
    } else {
      document.body.classList.remove("maximized");
    }
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
    case "Add Configuration":
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
      //shell.openExternal(app.getPath("userData"));
      shell.openItem(app.getPath("userData"));
      break;
    case "Exit":
      win.close();
      break;
    case "Stop Desktop Stream":
      {
        const video = document.getElementById("video-main");
        if (video.srcObject) {
          video.srcObject.getTracks()[0].stop();
          video.srcObject = null;
        }
        doMediaRecorder(false, null); // stop.
        e.target.innerText = "Start Desktop Stream";
      }
      break;
    case "Start Desktop Stream":
      {
        e.target.innerText = "Stop Desktop Stream";
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
      }
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
