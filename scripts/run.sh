#!/bin/bash
PRIV_KEY_PATH=/root/.ssh/priv.key

# run ssh-agent
eval `ssh-agent`

# add ssh-key
if [ -z ${SSHKEY+x} ]; then
    echo "SSHKEY is not set in env variables"
else
    mkdir -p /root/.ssh
    echo "$SSHKEY" >> $PRIV_KEY_PATH
    chmod 400 $PRIV_KEY_PATH
    ssh-add $PRIV_KEY_PATH
fi

export CONFIG_PATH=/tmp/twin_server_config.json
pushd $DIR_CODE/twin_server
node scripts/config_from_env.js $CONFIG_PATH
cd src
WIKI_FS=true node server.js -c $CONFIG_PATH
