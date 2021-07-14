FROM golang:alpine as builder

ENV DUMB_INIT_VERSION=1.2.2 \
    YGGDRASIL_VERSION=0.3.15

RUN set -ex \
    && apk --no-cache add \
    build-base \
    curl \
    git \
    && git clone "https://github.com/yggdrasil-network/yggdrasil-go.git" /src \
    && cd /src \
    && git reset --hard v${YGGDRASIL_VERSION} \
    && ./build \
    && curl -sSfLo /tmp/dumb-init "https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64" \
    && chmod 0755 /tmp/dumb-init

FROM ubuntu:latest
ARG  WWW_DIGITALTWIN_BRANCH=main

RUN apt-get -y update && apt-get -y upgrade
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y curl musl-tools nano iputils-ping procps iproute2 imagemagick sed build-essential libsodium-dev redis-server tmux
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN npm install --global yarn
RUN npm install pm2 -g


COPY --from=builder /src/yggdrasil    /usr/bin/
COPY --from=builder /src/yggdrasilctl /usr/bin/
COPY --from=builder /tmp/dumb-init    /usr/bin/
RUN mkdir /var/log/yggdrasil

COPY digitaltwin/sites.json /tmp/sites.json
WORKDIR /tmp
RUN sed -i "s/replace_www_digitaltwin_branch/${WWW_DIGITALTWIN_BRANCH}/gI" ./sites.json

RUN curl -L https://github.com/crystaluniverse/publishtools/releases/download/first/publishtools_linux > /usr/local/bin/publishtools
RUN chmod u+x /usr/local/bin/publishtools

##IDK why but it works
USER root
RUN publishtools install || echo "try 1" && publishtools install --reset
RUN publishtools build --pathprefix -r www_digitaltwin
RUN publishtools publish_config_save

RUN mkdir /publisher
WORKDIR /publisher
COPY . .
RUN rm config.json
RUN cp ./digitaltwin/config.json ./config.json
RUN rm -rf node_modules
RUN yarn install

COPY digitaltwin/startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN mkdir /appdata
RUN mkdir /appdata/user /appdata/chats
COPY ./digitaltwin/avatar.jpg /appdata/user/avatar-default

CMD /startup.sh