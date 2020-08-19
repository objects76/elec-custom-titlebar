
module.exports.notifyMe = function (msg, detail = null) {
    console.log(Notification.permission);
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return;
    }

    function notyObj() {
        let notification = new Notification(msg, {
            body: detail ? detail : msg,
            icon: "icons/code_70x70.png",
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