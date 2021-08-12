
FROM gitpod/workspace-full:latest

USER root
RUN apt-get update && apt-get install -y redis-server mc

USER gitpod
