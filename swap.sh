#!/bin/bash

PWD=$(pwd)

npm run compile || exit 1
docker build . -f ./Dev.Dockerfile -t adapters-travelperk-dev || exit 1
telepresence  --mount=/tmp/travelperk \
    --namespace adapters \
    --swap-deployment travelperk-integration --expose 8080 --expose 8050 \
    --docker-run --rm -v "${PWD}/build:/app/build" -p 8041:8080 -p 8042:8050 -p=9231:9230 \
    -e TELEPRESENCE_MOUNT_PATH="/tmp/travelperk" \
    -it adapters-travelperk-dev
