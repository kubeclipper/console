#!/bin/bash

echo "Add WorkLoad = $1"

# 软件版本信息
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_REF=$(git rev-parse --verify HEAD)
BUILD_TIME=$(date -u '+%Y-%m-%d/%I:%M:%S')
COMMIT_TIME=$(git show --pretty=format:"%ci %cr" | HEAD -1)
ADD_WORKLOAD=$1

yarn run build:run -- --env.BRANCH=$BRANCH --env.COMMIT_REF=$COMMIT_REF --env.BUILD_TIME=$BUILD_TIME --env.COMMIT_TIME=$COMMIT_TIME  --env.ADD_WORKLOAD=$ADD_WORKLOAD
