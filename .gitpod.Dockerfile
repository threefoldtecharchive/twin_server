
# FROM golang:alpine as builder
FROM gitpod/workspace-full:latest

USER root


RUN apt-get update && apt-get install -y mc rsync redis-server
RUN apt-get install -y curl musl-tools nano iputils-ping procps iproute2 imagemagick sed build-essential libsodium-dev redis-server tmux

# ADD gitpod_scripts/* /tmp/

# RUN bash /tmp/yggdrasil.sh

#prepare for gitpod nodejs env
# RUN bash /tmp/nodejs.sh

# RUN apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

USER gitpod

# ENTRYPOINT [ "/usr/bin/bash" ]

