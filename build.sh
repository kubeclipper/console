#!/bin/bash

ADD_WORKLOAD=${1:-false}
echo "Add WorkLoad = $ADD_WORKLOAD"

# 软件版本信息
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown-branch")
COMMIT_REF=$(git rev-parse --verify HEAD 2>/dev/null || echo "unknown-commit")
BUILD_TIME=$(date -u '+%Y-%m-%d/%I:%M:%S')
COMMIT_TIME=$(git log -1 --format=%ai HEAD 2>/dev/null | sed 's/ /T/g' || echo "unknown-time")

yarn run build:run -- --env.BRANCH=$BRANCH --env.COMMIT_REF=$COMMIT_REF --env.BUILD_TIME=$BUILD_TIME --env.COMMIT_TIME=$COMMIT_TIME  --env.ADD_WORKLOAD=$ADD_WORKLOAD

# 定义版本信息文件路径（dist目录下的version.json，也可改为txt格式）
VERSION_FILE="./dist/version.json"

# 检查dist目录是否存在
if [ ! -d "./dist" ]; then
    echo "错误：dist目录不存在，打包可能失败，跳过版本信息写入"
    exit 1
fi

# 将版本信息写入JSON文件（易读且便于程序解析）
cat > $VERSION_FILE << EOF
{
  "branch": "$BRANCH",
  "commit_ref": "$COMMIT_REF",
  "build_time": "$BUILD_TIME",
  "commit_time": "$COMMIT_TIME",
  "add_workload": "$ADD_WORKLOAD"
}
EOF

# 验证文件是否写入成功
if [ -f "$VERSION_FILE" ]; then
    echo "版本信息已成功写入：$VERSION_FILE"
    # 可选：打印文件内容确认
    # cat $VERSION_FILE
else
    echo "警告：版本信息文件写入失败"
fi
