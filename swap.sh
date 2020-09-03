#!/bin/bash

PWD=$(pwd)

npm run compile || exit 1
docker build . -f ./Dev.Dockerfile -t adapters-travelperk-dev || exit 1
telepresence  --mount=/tmp/travelperk \
    --namespace adapters \
    --swap-deployment travelperk-integration --expose 8080 \
    --docker-run --rm -v "${PWD}/build:/app/build" -p 8040:8080 -p=9230:9230 \
    -e TELEPRESENCE_MOUNT_PATH="/tmp/travelperk" \
    -it adapters-travelperk-dev
