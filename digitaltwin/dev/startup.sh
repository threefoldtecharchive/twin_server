#/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

cd /publisher &&  node server.js &

#node dist/migrator/migrator.js
#if [ $? -eq 0 ]
#then
#  pm2 start dist/src/index.js &
#else
#  echo "Migrations failed"
#  mv /var/tmp/error-nginx.conf /etc/nginx/conf.d/default.conf
#fi

tail -f /dev/null