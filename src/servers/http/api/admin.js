var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler')
const { exec } = require("child_process");


// Add SSH Key to authorized keys
router.post('/ssh', asyncHandler(async (req, res) => {
    const {sshKey} = req.body;
    if(!sshKey){
        return res.json({"error": "Missing 'sshKey' from request body"});
    }
    if(keyAlreadyExists(sshKey)){
        return res.json({"error": "Key already exists"});
    }
    const result = exec(`echo ${sshKey} >> ~/.ssh/authorized_keys`);
    for await (const error of result.stderr) {
        console.log(`${error}`);
        return res.json({"error": "Failed to add key, please contact support."});
    };
    return res.json({"addedKey": sshKey});
}));

// Get IP address
router.get('/ip', asyncHandler(async (req, res) => {
    const result = exec(`ip -o -4 addr list | awk '{print $4}' | cut -d/ -f1`);
    for await (const ips of result.stdout) {
        ips_array = ips.trim().split("\n");
        return res.json({"ips": ips_array});
    };
    return res.json({"error": "Failed to get ip address, please contact support."});
}))


// Pull all repos
router.get('/pull', asyncHandler(async (req, res) => {
    const errorResponse = publishToolsOperate("pull", "Failed to pull repos, please contact support.");
    if(errorResponse){
        return errorResponse;
    }
    return res.json({"message": "All repos pulled successfully."});
}))

// Update publish tools
router.get('/update', asyncHandler(async (req, res) => {
    const result = await publishToolsOperate("update");
    if(result === false){
        return res.json({"message": "Failed to update publishtools, please contact support."})
    }
    return res.json({"message": "Publish tools updated successfully."});
}))

// Flatten wikis
router.get('/flatten', asyncHandler(async (req, res) => {
    const result = await publishToolsOperate("flatten");
    if(result === false){
        return res.json({"message": "Failed to flatten wikis, please contact support."})
    }
    return res.json({"message": "All wikis flattened successfully."});
}))


var publishToolsOperate = async function(operation){
    const result = exec(`publishtools ${operation}`);
    let success;
    for await (const stdout of result.stdout) {
        console.log(`stdout: ${stdout}`);
        success = true;
    };
    for await (const stderr of result.stderr) {
        console.log(`STDERR: ${stderr}`);
        success = false;
    };
    return success;
}



var keyAlreadyExists = async function(sshKey){
    exec("mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys");
    const result = exec(`grep -c "${sshKey}" ~/.ssh/authorized_keys`);
    for await (const count of result.stdout) {
        return count;
    };
}


module.exports = router
