#!/bin/sh
cd /usr/src/app/wait-for-it && ./wait-for-it.sh -t 60 postgres:5432

cd  /usr/src/app/api \
    && apk --no-cache --virtual build-dependencies add git python make g++ \
    && apk add curl \
    && git config --global url."https://".insteadOf git:// \
    && yarn install \
    && yarn cache clean --force \
    && apk del build-dependencies \
    && cd ..

exec "$@"