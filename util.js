module.exports.delegate = function (target, selector, eventName, handler) {
  target.addEventListener(eventName, (e) => {
    for (
      var target = e.target;
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
};

const os = require("os");
const isWin32 = os.platform() === "win32";
const isMac = os.platform() === "darwin";
const isLinux = !isWin32 && !isMac;

module.exports.isWin32 = isWin32;
module.exports.isMac = isMac;
module.exports.isLinux = isLinux;
