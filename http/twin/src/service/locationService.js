"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyLocation = void 0;
const { exec } = require('child_process');
const getMyLocation = () => {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        exec("yggdrasilctl  -v getSelf | sed -n -e 's/^.*IPv6 address.* //p'", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return reject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return reject();
            }
            const address = stdout.replace(/(\r\n|\n|\r)/gm, '').trim();
            resolve(address);
        });
    });
};
exports.getMyLocation = getMyLocation;
