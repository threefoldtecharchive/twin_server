set -e
cd wiki
mkdir -p /appdata/user
mkdir -p /appdata/chat
mkdir -p /appdata/chats 

publishtools install
publishtools staticfiles update
publishtools build
publishtools flatten

cd ../src
WIKI_FS=true node server.js