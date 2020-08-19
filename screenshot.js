
const { desktopCapturer } = require('electron');
/**
* Create a screenshot of the entire screen using the desktopCapturer module of Electron.
*
* @param callback {Function} callback receives as first parameter the base64 string of the image
* @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
**/
module.exports.fullscreenScreenshot = function (callback, imageFormat) {
    var _this = this;
    this.callback = callback;
    imageFormat = imageFormat || 'image/jpeg';

    this.handleStream = (stream) => {
        // Create hidden video tag
        var video = document.createElement('video');
        video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';


        // Event connected to stream
        video.onloadedmetadata = function () {
            // Set video ORIGINAL height (screenshot)
            video.style.height = this.videoHeight + 'px'; // videoHeight
            video.style.width = this.videoWidth + 'px'; // videoWidth

            video.play();

            // Create canvas
            let srcCanvas = document.createElement('canvas');
            srcCanvas.width = this.videoWidth;
            srcCanvas.height = this.videoHeight;
            let ctx = srcCanvas.getContext('2d');
            // Draw video on canvas
            ctx.drawImage(video, 0, 0, srcCanvas.width, srcCanvas.height);

            if (_this.callback) {
                // Save screenshot to base64
                _this.callback(srcCanvas.toDataURL(imageFormat));
            } else {
                console.log('Need callback!');
            }

            // Remove hidden video tag
            video.remove();
            try {
                // Destroy connect to stream
                stream.getTracks()[0].stop();
            } catch (e) { }
        }

        video.srcObject = stream;
        document.body.appendChild(video);
    };

    this.handleError = function (e) {
        console.log('fullscreenScreenshot:', e);
    };

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        console.log(sources);

        for (const source of sources) {
            // Filter: main screen
            if ((source.name === "Entire screen") || (source.name === "Screen 1") || (source.name === "Screen 2")) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1280,
                                maxWidth: 4000,
                                minHeight: 720,
                                maxHeight: 4000
                            }
                        }
                    });

                    _this.handleStream(stream);
                } catch (e) {
                    _this.handleError(e);
                }
            }
        }
    });
}