import redis from "redis";
const client = redis.createClient();
(async () => {
    await client.connect();
})();

function getHashData(key, id) {
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
    return client.geoSearchWith(key, {latitude, longitude}, {radius: 50, unit: "km"}, ["WITHCOORD"], {SORT: "ASC"});
}
function setStringData(key, value) {
    return client.set(key, JSON.stringify(value));
}

const getPickupId = () => {
    return getStringData("pickup:id");
};

const setPickupData = async value => {
    const id = await incId("pickup:id");
    return setHashData("pickup:data", id, {...value, id});
};

const setHub = value => {
    return setStringData("hub:data", value);
};

const getHub = () => {
    return getStringData("hub:data");
};

const addGeoData = (coordinates, id) => {
    return setGeoData("package:coordinate", coordinates.x, coordinates.y, id);
};

const getGeoLocations = coordinates => {
    return geosearch("package:coordinate", coordinates.x, coordinates.y);
};

const setRiderData = async value => {
    const id = await incId("rider:id");
    return setHashData("rider:data", id, {...value, id});
};

const updateRiderData = (id, value) => {
    return setHashData("rider:data", id, value);
};

const getRiderData = id => {
    return getHashData("rider:data", id);
};

export default {
    getPickupId,
    setPickupData,
    setHub,
    getHub,
    addGeoData,
    getGeoLocations,
    setRiderData,
    updateRiderData,
    getRiderData,
};
