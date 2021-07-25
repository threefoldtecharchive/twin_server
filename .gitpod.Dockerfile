
# FROM golang:alpine as builder
FROM gitpod/workspace-full:latest

RUN apt-get update && apt-get install -y mc rsync 

RUN bash gitpod_scripts/yggdrasil.sh

USER root

RUN apt-get install -y curl musl-tools nano iputils-ping procps iproute2 imagemagick sed build-essential libsodium-dev redis-server tmux

#prepare for gitpod nodejs env
RUN bash gitpod_scripts/install_docker.sh

# RUN apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

USER gitpod

# ENTRYPOINT [ "/usr/bin/bash" ]

