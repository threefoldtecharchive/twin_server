const chalk = require('chalk');
const fs = require('fs');
const process = require("process")

const { Server: HyperspaceServer } = require('hyperspace');
const { Client: HyperspaceClient } = require('hyperspace')
const HyperDrive = require('hyperdrive')

const config = require('../config.js');
const utils = require('./utils.js');

let client
let server

async function load(){
    var res = []
    config.hyperdrive.drives.forEach( async function(item) {
        let drive = new HyperDrive(client.corestore(), item.key)
        await drive.promises.ready()
        await client.replicate(drive)
        await new Promise(r => setTimeout(r, 3e3)) // just a few seconds
        await client.network.configure(drive, {announce: false, lookup: false})
        drive.name = item.name
        // config.drives[item.key] = drive
        console.log(chalk.blue(`✓ (HyperSpace Drive) loaded ${item.name} (${item.key})`))
        res.push(... await utils.loadInfo(drive))
    })
    return res
}

async function start () {

    try {
        client = new HyperspaceClient()
        await client.ready()
    } catch (e) {
        // no daemon, start it in-process
        server = new HyperspaceServer({storage: config.hyperdrive.path})
        await server.ready()
        client = new HyperspaceClient()
        await client.ready()
        var status = await client.status()
        console.log(chalk.green(`✓ (HyperSpace Daemon) started from ${config.hyperdrive.path} with status`))
        console.log(status)
    }

    return {
        client,
        async cleanup () {
            await client.close()
            if (server) {
                await server.stop()
                console.log(chalk.green('✓ (HyperSpace Daemon)'))
                console.log(chalk.red('\t✓ closed'));
            }
        }
    }
}

module.exports = {
    start: start,
    load: load,
}
