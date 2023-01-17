import axios from "axios";
import config from "../config/config.js";

const RandomRange = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

const getCoordinatesFromAddress = address => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.googleApiKey}`);
};

const calcAverage = (pkg, type) => {
    let val = 0;
    pkg.forEach(p => {
        val += Number(p.dimensions[type]);
    });

    return val / pkg.length;
};

const filterError = (pkg, type) => {
    const avg = calcAverage(pkg, type);
    const change = pkg.reduce((acc, vap) => acc + Math.abs(vap.dimensions[type] - avg), 0);
    const error = (change * 100) / (pkg.length * avg);
    return {avg, error};
};

const calculateErrorfromPackage = pkg => {
    pkg = pkg.map(function (p) {
        const val = p.dimensions;
        Object.assign(p.dimensions, {volumetric: String(val.length * val.breadth * val.height)});
        return p;
    });

    const lengthError = filterError(pkg, "length");
    const breathError = filterError(pkg, "breadth");
    const heightError = filterError(pkg, "height");
    const weightError = filterError(pkg, "weight");
    const volumetricError = filterError(pkg, "volumetric");
    return {
        length: lengthError,
        breadth: breathError,
        height: heightError,
        weight: weightError,
        volume: volumetricError,
    };
};

export {RandomRange, getCoordinatesFromAddress, calculateErrorfromPackage};
