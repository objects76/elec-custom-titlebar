function delegate(target, selector, eventName, handler) {
  target.addEventListener(eventName, (e) => {
    for (
      let target = e.target;
      target && target != this;
      target = target.parentNode
    ) {
      // loop parent nodes from the target to the delegation node
      if (target.matches(selector)) {
        handler(e);
        break;
      }
    }
  });
}

function notifyMe(msg, detail = null) {
  console.log(Notification.permission);
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
    return;
  }

  function notyObj() {
    let notification = new Notification(msg, {
      body: detail ? detail : msg,
      icon: "icons/vscode-70x70.png",
    });
    setTimeout(notification.close.bind(notification), 4000);
  }
  // Let's check whether notification permissions have already been granted
  if (Notification.permission === "granted") {
    notyObj();
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        notyObj();
      }
    });
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
async function startCapture() {
  let displayMediaOptions = {
    video: {
      cursor: "always",
    },
    audio: false,
  };
  try {
    return await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch (err) {
    console.error("Error: " + err);
  }
  return null;
}

// add menubar event handler.
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
    case "Stop Desktop Stream":
      e.target.innerText = "Start Desktop Stream";
      let tracks = document.querySelector("#video-main").srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      document.querySelector("#video-main").srcObject = null;

      document.querySelector("#youTubePlayer1").style.display = "block";
      document.querySelector("#video-main").style.display = "none";
      break;
    case "Start Desktop Stream":
      e.target.innerText = "Stop Desktop Stream";
      document.querySelector("#youTubePlayer1").style.display = "none";
      document.querySelector("#video-main").style.display = "block";
      document.querySelector("#video-main").srcObject = await startCapture();
      document.querySelector("#video-main").play();
      break;
  }
  menubar.classList.toggle("opened");
});

function min_max_window(maximize) {
  if (maximize) {
    document.body.classList.add("maximized");
    document.documentElement.requestFullscreen(); // to fullscreen mode
  } else {
    document.body.classList.remove("maximized");
    document.exitFullscreen(); // restore from fullscreen mode
  }
}
document.querySelector("#drag-region").addEventListener("dblclick", () => {
  min_max_window(document.body.classList.contains("maximized") == false);
});

// system buton settings
document.getElementById("min-button").addEventListener("click", (event) => {
  notifyMe("Click minimize.");
});

document.getElementById("max-button").addEventListener("click", (event) => {
  min_max_window(true);
});

document.getElementById("restore-button").addEventListener("click", (event) => {
  min_max_window(false);
});

document.getElementById("close-button").addEventListener("click", (event) => {
  notifyMe("click close.");
});

//  <!-- open external app -->

function LaunchURLScript() {
  var url = "JJKIMProtocol:";
  let path = "";
  window.open(url + path);
  self.focus();
}
