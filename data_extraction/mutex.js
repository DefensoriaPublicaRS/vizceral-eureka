let state = false;

function lock() {
    state = true;
}

function unlock() {
    state = false;
}

function isLocked() {
    return state
}

module.exports = {
    lock: lock,
    unlock: unlock,
    isLocked: isLocked
};
