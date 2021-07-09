FROM golang:alpine as builder

ENV DUMB_INIT_VERSION=1.2.2 \
    YGGDRASIL_VERSION=0.3.15 \
    NODE_ENV="production" \
    SECRET="ecc000ad-635f-4afb-9723-19448ca01e62" \
    THREEBOT_PHRASE="system sunset never robot news immune deputy away release mandate poverty elite wall vendor beyond wisdom offer gap great suspect flag narrow enjoy around"

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

FROM ubuntu:20.04
RUN apt -y update && apt -y upgrade
RUN apt install -y nginx curl musl-tools nano iputils-ping procps iproute2 imagemagick

COPY --from=builder /src/yggdrasil    /usr/bin/
COPY --from=builder /src/yggdrasilctl /usr/bin/
COPY --from=builder /tmp/dumb-init    /usr/bin/
RUN mkdir /var/log/yggdrasil


RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt install -y nodejs
RUN npm install --global yarn

COPY ./dev/startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN mkdir /appdata
RUN mkdir /appdata/user /appdata/chats
COPY ./avatar.jpg /appdata/user/avatar-default

CMD /startup.sh
