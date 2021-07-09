FROM ubuntu:latest as publisher

# Install nodejs

RUN apt update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_15.x |  bash -
RUN apt-get install -y nodejs

RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install libsodium-dev build-essential -y

RUN mkdir /root/.publisher
WORKDIR /root/.publisher

COPY /home/hamdy/.publisher/publish/* .

WORKDIR /publisher
COPY ./* ./

RUN npm install
RUN sed 's/"development": true/"development": false/g' config.json
RUN node server

