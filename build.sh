#!/bin/bash

ADD_WORKLOAD=${1:-false}
echo "Add WorkLoad = $ADD_WORKLOAD"

# 软件版本信息
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown-branch")
COMMIT_REF=$(git rev-parse --verify HEAD 2>/dev/null || echo "unknown-commit")
BUILD_TIME=$(date -u '+%Y-%m-%d/%I:%M:%S')
COMMIT_TIME=$(git log -1 --format=%ai HEAD 2>/dev/null | sed 's/ /T/g' || echo "unknown-time")

yarn run build:run -- --env.BRANCH=$BRANCH --env.COMMIT_REF=$COMMIT_REF --env.BUILD_TIME=$BUILD_TIME --env.COMMIT_TIME=$COMMIT_TIME  --env.ADD_WORKLOAD=$ADD_WORKLOAD
