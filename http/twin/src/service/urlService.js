"use strict";
// const ipv4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]+)?$/
// const isIpv4 = ipv4Regex.test(location);
// location = isIpv4 ? location : `[${location}]`;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullIPv6ApiLocation = void 0;
const getFullIPv6ApiLocation = (location, apiEndPoint) => {
    return `http://[${location}]/api${apiEndPoint}`;
};
exports.getFullIPv6ApiLocation = getFullIPv6ApiLocation;
