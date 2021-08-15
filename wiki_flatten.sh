set -ex

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
echo " - **** PUBLISHTOOLS INSTALL ****"
publishtools install
echo " - **** PUBLISHTOOLS STATICFILES UPDATE ****"
publishtools staticfiles update
echo " - **** PUBLISHTOOLS FLATTEN ****"
publishtools flatten
# publishtools build
popd

pushd src

[ ! -d "$DIR_BASE/static/cookie-consent.js" ] && sed -i 's/(\\\\#\[-a-z\\\\d_\]\*)/(\\\\#\[\/-a-z\\\\d_\]\*)/g' $DIR_BASE//static/cookie-consent.js

echo " - *** RUN SERVER ***"
WIKI_FS=true node server.js

popd
