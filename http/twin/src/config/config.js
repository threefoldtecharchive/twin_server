"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
let userid = process.env.USER_ID || 'jensmeire';
let appId = process.env.DIGITALTWIN_APPID || 'digitaltwin.jimbertesting.be';
let environment = process.env.ENVIRONMENT || 'production';
exports.config = {
    appBackend: environment === 'production' ? 'https://login.threefold.me' : 'https://login.staging.jimber.org',
    kycBackend: environment === 'production' ? 'https://openkyc.live' : 'http://openkyc.staging.jimber.org',
    appId: `${userid}.${appId}`,
    seedPhrase: 'calm science teach foil burst until next mango hole sponsor fold bottom cousin push focus track truly tornado turtle over tornado teach large fiscal',
    baseDir: process.env.BASEDIR || '/appdata/',
    userid,
    storage: '/storage/',
    yggdrasil: {
        peers: environment === "development" ? [] : [
            "tls://[2a02:1802:5e:0:18d2:e2ff:fe44:17d2]:9944",
            "tcp://212.129.52.193:39565",
            "tcp://94.130.203.208:5999",
            "tcp://85.17.15.221:35239",
            "tcp://104.248.15.125:31337",
            "tcp://[2604:a880:800:c1::2c2:a001]:31337"
        ]
    }
};
