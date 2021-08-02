# # set -e

pushd src
[ ! -d "node_modules" ] &&  npm install
popd 

pushd wiki
sudo mkdir -p /appdata/user
sudo mkdir -p /appdata/chat
sudo mkdir -p /appdata/chats
sudo chown -R gitpod:gitpod /appdata

publishtools install
publishtools staticfiles update
publishtools build
publishtools flatten
popd

pushd src

WIKI_FS=true node server.js

popd
