#!/bin/bash

if [ ! -d "./dev/appdata/chats" ]; then
  mkdir -p "./dev/appdata/chats"
fi

if [ ! -d "./dev/appdata/user" ]; then
  mkdir -p "./dev/appdata/user"
fi

if [ ! -d "./dev/appdata1/chats" ]; then
  mkdir -p "./dev/appdata1/chats"
fi

if [ ! -d "./dev/appdata1/user" ]; then
  mkdir -p "./dev/appdata1/user"
fi

docker network create chatnet
cd ./dev/ && docker-compose up -d --build


tmux new-session \; split-window -h \; select-pane -t 0 \; \
  send-keys "docker logs bob-chat --follow" ENTER \; select-pane -t 1 \; \
  send-keys "docker logs alice-chat --follow" ENTER