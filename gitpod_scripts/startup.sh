#/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

service redis-server start
sed -i "s/replace_user_id/$USER_ID/gI" /root/.publisher/sites.json

#node dist/migrator/migrator.js
#if [ $? -eq 0 ]
#then
#  pm2 start dist/src/index.js &
#else
#  echo "Migrations failed"
#  mv /var/tmp/error-nginx.conf /etc/nginx/conf.d/default.conf
#fi

tmux new -d -s "digitaltwin"
tmux send-keys -t digitaltwin.0 "cd /root/.publisher && publishtools develop" ENTER
tmux new-window -t digitaltwin:1
tmux send-keys -t digitaltwin:1 "export THREEBOT_PHRASE=\$THREEBOT_PHRASE" ENTER
tmux send-keys -t digitaltwin:1 "export USER_ID=\$USER_ID" ENTER
tmux send-keys -t digitaltwin:1 "export DIGITALTWIN_APPID=\$DIGITALTWIN_APPID" ENTER
tmux send-keys -t digitaltwin:1 "export ENVIRONMENT=\$ENVIRONMENT" ENTER
tmux send-keys -t digitaltwin:1 "export SECRET=\$SECRET" ENTER
tmux send-keys -t digitaltwin:1 "export ENABLE_SSL=\$ENABLE_SSL" ENTER
tmux send-keys -t digitaltwin:1 "cd /publisher && pm2 start server.js" ENTER

tail -f /dev/null