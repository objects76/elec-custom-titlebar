

module.exports.delegate = function (target, selector, eventName, handler) {
    target.addEventListener(eventName, (e) => {
        for (var target = e.target; target && target != this; target = target.parentNode) {
            // loop parent nodes from the target to the delegation node
            if (target.matches(selector)) {
                handler(e);
                break;
            }
        }
    });
}