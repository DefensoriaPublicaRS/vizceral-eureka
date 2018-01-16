let cachedData = {};

module.exports = {
    get: function () {
        return cachedData;
    },
    set: function (newData) {
        cachedData = newData;
    }
};
