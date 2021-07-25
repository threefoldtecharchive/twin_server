
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


FROM gitpod/workspace-full:latest

USER root
RUN apt-get update && apt-get install -y mc rsync 

COPY --from=builder /src/yggdrasil    /usr/bin/
COPY --from=builder /src/yggdrasilctl /usr/bin/
COPY --from=builder /tmp/dumb-init    /usr/bin/
RUN mkdir /var/log/yggdrasil

#prepare for gitpod nodejs env
# RUN bash gitpod_scripts/install_docker.sh

# RUN apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

USER gitpod

# ENTRYPOINT [ "/usr/bin/bash" ]

