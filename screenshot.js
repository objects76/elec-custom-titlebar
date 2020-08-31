const { desktopCapturer } = require("electron");
const { app } = require("electron").remote;
const fs = require("fs");
const path = require("path");

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/

module.exports.getDesktopStream = async function (sourceName) {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
    });
    for (const source of sources) {
      // Filter: main screen
      console.log(source);
      if (source.name !== sourceName) continue;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 4000,
              minHeight: 720,
              maxHeight: 4000,
            },
          },
        });

        return stream;
      } catch (e) {
        console.error(e);
      }
    }
  } catch (e) {
    console.error(e);
  }

  return null;
};

module.exports.fullscreenScreenshot = function (callback, imageFormat) {
  var _this = this;
  this.callback = callback;
  imageFormat = imageFormat || "image/jpeg";

  this.handleStream = (stream, sourceId) => {
    // Create hidden video tag
    var video = document.createElement("video");
    video.style.cssText = "position:absolute;top:-10000px;left:-10000px;"; // nonvisible

    // Event connected to stream
    video.onloadedmetadata = async function () {
      // Set video ORIGINAL height (screenshot)
      video.style.height = this.videoHeight + "px"; // videoHeight
      video.style.width = this.videoWidth + "px"; // videoWidth

      video.play();

      // Create canvas
      var canvas = document.createElement("canvas");
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      var ctx = canvas.getContext("2d");
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (_this.callback) {
        // Save screenshot to base64
        _this.callback(canvas.toDataURL(imageFormat));
      } else {
        const filePath = path.join(
          app.getPath("userData"),
          sourceId.replace(/:/g, "_") + ".jpeg"
        );
        console.log("output:", filePath);

        const url = canvas.toDataURL(imageFormat, 0.8);
        // remove Base64 stuff from the Image
        const base64Data = url.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(filePath, base64Data, "base64", function (err) {
          if (err) console.log(err);
        });
      }

      // Remove hidden video tag
      video.remove();
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    video.srcObject = stream;
    document.body.appendChild(video);
  };

  this.handleError = function (e) {
    console.log(e);
  };

  desktopCapturer.getSources({ types: ["screen"] }).then(async (sources) => {
    console.log(sources);

    for (const source of sources) {
      // Filter: main screen
      console.log(source);
      if (
        source.name === "Entire Screen" ||
        source.name === "Screen 1" ||
        source.name === "Screen 2"
      ) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: source.id,
                minWidth: 1280,
                maxWidth: 4000,
                minHeight: 720,
                maxHeight: 4000,
              },
            },
          });

          _this.handleStream(stream, source.id);
        } catch (e) {
          _this.handleError(e);
        }
      }
    }
  });
};
