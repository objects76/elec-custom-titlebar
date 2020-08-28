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

module.exports.isWin32 = process.platform === "win32";
module.exports.isMac = process.platform === "darwin";
module.exports.isLinux =
  process.platform !== "win32" && process.platform !== "darwin";
