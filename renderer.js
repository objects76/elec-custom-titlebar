const remote = require('electron').remote;
const { shell } = require('electron');
const { app } = remote;
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
}

function handleWindowControls() {

    // menubar class settings
    const rootMenuItems = document.querySelectorAll("#menubar > ul > li");
    for (let li of rootMenuItems) {
        li.addEventListener("click", (e) => {
            document.querySelector("#menubar > ul").classList.toggle("opened");
        });
    }

    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        win.maximize();
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        win.unmaximize();
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}


// menu handler
const { delegate } = require('./util');
const { fullscreenScreenshot, getDesktopStream } = require('./screenshot');
const { notifyMe } = require('./notification');

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
        case 'Full screenshot':
            fullscreenScreenshot(null, "image/jpeg");
            // fullscreenScreenshot(function (base64data) {
            //     document.getElementById("my-preview").setAttribute("src", base64data);
            // }, "image/png");
            break;
        case 'App screenshot':
            break;
        case 'Open Data Folder':
            // shell.openExternal('https://github.com');
            shell.openExternal(app.getPath('userData'));
            break;
        case 'Exit':
            win.close();
            break;
        case 'Start Desktop Stream':
            const video = document.getElementById('main');
            if (video.srcObject) {
                video.srcObject.getTracks()[0].stop();
                video.srcObject = null;
            }
            else {
                const stream = await getDesktopStream('Screen 2');
                console.log(video.src);
                console.log(video.srcObject);

                // video.onloadedmetadata = function () { video.play(); }
                video.srcObject = stream;
                console.log(stream);
                console.log(video.src);
                video.play();
                setTimeout(() => video.pause(), 300);
            }
            break;
        default:
            console.warn("Not handled:" + e.target.innerText);
            break;
    }
    //menubar.classList.toggle("opened");
});


