import axios from "axios";
import config from "../config/config.js";

const RandomRange = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

const getCoordinatesFromAddress = address => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.googleApiKey}`);
};

export {RandomRange, getCoordinatesFromAddress};
