const redis = require("redis");
const client = redis.createClient();

(async () => {
    await client.connect();
})();

function getHashData(key, id) {
    console.log(key, id);
    return client.hGet(key, id);
}

function setHashData(key, id, value) {
    return client.hSet(key, id, JSON.stringify(value));
}

function setGeoData(key, latitude, longitude, id) {
    return client.geoAdd(key, {latitude, longitude, member: id});
}

function incId(key) {
    return client.incr(key);
}

function getStringData(key) {
    return client.get(key);
}

function geosearch(key, latitude, longitude) {
    console.log(key, latitude, longitude);
    return client.geoSearchWith(key, {latitude, longitude}, {radius: 50, unit: "km"}, ["WITHCOORD"], {SORT: "ASC"});
}
function setStringData(key, value) {
    return client.set(key, JSON.stringify(value));
}

exports.getPickupId = () => {
    return getStringData("pickup:id");
};

exports.setPickupData = async value => {
    const id = await incId("pickup:id");
    return setHashData("pickup:data", id, {...value, id});
};

exports.setHub = value => {
    return setStringData("hub:data", value);
};

exports.getHub = () => {
    return getStringData("hub:data");
};

exports.addGeoData = (coordinates, id) => {
    return setGeoData("package:coordinate", coordinates.x, coordinates.y, id);
};

exports.getGeoLocations = coordinates => {
    return geosearch("package:coordinate", coordinates.x, coordinates.y);
};

exports.setRiderData = async value => {
    const id = await incId("rider:id");
    return setHashData("rider:data", id, {...value, id});
};

exports.updateRiderData = (id, value) => {
    return setHashData("rider:data", id, value);
};

exports.getRiderData = id => {
    return getHashData("rider:data", id);
};
