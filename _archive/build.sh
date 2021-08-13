#/bin/sh
rm -rf build

TARGET=""

case "$OSTYPE" in
  linux*)
	TARGET="linux-x64"
	  ;;
  darwin*)
	TARGET="darwin-x64"
	  ;;
esac

echo $TARGET

cp "node_modules/sodium-native/prebuilds/$TARGET/node.napi.node" ./sodium.node
cp "node_modules/sodium-native/prebuilds/$TARGET/libsodium.so.23" ./libsodium.so.23 
cp "node_modules/leveldown/prebuilds/$TARGET/node.napi.glibc.node"  ./node.napi.glibc.node 
cp "node_modules/leveldown/prebuilds/$TARGET/node.napi.glibc.node" ./node.napi.musl.node
cp "node_modules/utp-native/prebuilds/$TARGET/node.napi.node" ./utp.node
cp "node_modules/fd-lock/prebuilds/$TARGET/node.napi.node" ./fdlock.node

mkdir -p build

pkg --targets node14-$TARGET .
mkdir -p build/node_modules/sodium-native/prebuilds/ && cp -r "node_modules/sodium-native/prebuilds/$TARGET" build/node_modules/sodium-native/prebuilds/
mkdir -p build/node_modules/leveldown/prebuilds/ && cp -r "node_modules/leveldown/prebuilds/$TARGET" build/node_modules/leveldown/prebuilds/
mkdir -p build/node_modules/utp-native/prebuilds/ && cp -r "node_modules/utp-native/prebuilds/$TARGET" build/node_modules/utp-native/prebuilds
mkdir -p build/node_modules/fd-lock/prebuilds/ && cp -r "node_modules/fd-lock/prebuilds/$TARGET" build/node_modules/fd-lock/prebuilds

cp config.json build
cp -r db build
cp digitaltwin build

