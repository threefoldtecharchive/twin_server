set -e

pushd src
echo " - *** NPM INSTALL ***"
[ ! -d "node_modules" ] &&  npm install
popd 

echo " - *** CREATE DIRS ***"

sudo mkdir -p /appdata/user
sudo mkdir -p /appdata/chat
sudo mkdir -p /appdata/chats
sudo chown -R gitpod:gitpod /appdata

#PUBLISHTOOLS PART
echo " - *** PUBLISHTOOLS PREPARE ***"
pushd wiki_config
publishtools install
publishtools staticfiles update
publishtools build
publishtools flatten
popd

pushd src

[ ! -d "~/.publisher/static/cookie-consent.js" ] && sed -i 's/(\\\\#\[-a-z\\\\d_\]\*)/(\\\\#\[\/-a-z\\\\d_\]\*)/g' ~/.publisher/static/cookie-consent.js

echo " - *** RUN SERVER ***"
WIKI_FS=true node server.js

popd
