FROM ubuntu:20.04
RUN apt-get update
ENV DEBIAN_FRONTEND="noninteractive"
ENV TZ="Europe/London"
ENV TERM=xterm
ENV DIR_BASE=/workspace
ENV DIR_CODE=/workspace/code
ENV DIR_CODEWIKI=/workspace/code/wiki
RUN apt-get install -y sudo git curl libssl-dev mc rsync redis-server musl-tools nano iputils-ping procps iproute2 imagemagick sed build-essential libsodium-dev tmux openssh-server
#RUN curl https://raw.githubusercontent.com/crystaluniverse/crystaltools/development/install.sh > /tmp/install.sh
#RUN bash /tmp/install.sh
#RUN
RUN mkdir -p /workspace/code
WORKDIR /workspace/code
RUN git clone https://github.com/vlang/v && cd v && make && ./v symlink
RUN v install despiegk.crystallib && \
    v install patrickpissurno.redis && \
    v install despiegk.crystallib && \
    v install nedpals.vex
WORKDIR /workspace/code
RUN git clone https://github.com/crystaluniverse/crystaltools
RUN cd crystaltools/crystaltools && v publishtools.v && cp publishtools /usr/bin
RUN mkdir ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
COPY . /workspace/code/twin_server
WORKDIR /workspace/code/twin_server
RUN cd src && npm install
RUN mkdir -p /appdata/user -p /appdata/chat -p /appdata/chats -p /workspace/publisher/publish
RUN chmod +x scripts/run.sh

ENTRYPOINT ["bash",  "/workspace/code/twin_server/scripts/run.sh"]
