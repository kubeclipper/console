############################
# How to build
############################
# In the same directory as package.json
# $ DOCKER_BUILDKIT=1 docker build -t kubeclipper-console -f "docker/prod.dockerfile" ./

############################
# How to run
############################
# without any config
# $ docker run -d --name kubeclipper-console --restart=always --net=host -v /var/log/nginx:/var/log/nginx kubeclipper-console:latest
# with your_nginx_file
# $ docker run -d --name kubeclipper-console --restart=always --net=host -v /var/log/nginx:/var/log/nginx -v your_nginx_file:/etc/nginx/nginx.conf kubeclipper-console:latest

# Setp1. Build dist
FROM caas.registry.com/library/node:12-alpine AS builder

COPY ./ /root/kubeclipper-console/
WORKDIR /root/kubeclipper-console
RUN apk add python2 make g++
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn config set network-timeout 300000
RUN yarn install
RUN yarn run build

# Step2. Put into nginx
FROM caas.registry.com/library/nginx:1.21.4-alpine

ARG REPO_URL
ARG BRANCH
ARG COMMIT_REF
LABEL repo-url=$REPO_URL
LABEL branch=$BRANCH
LABEL commit-ref=$COMMIT_REF

COPY --from=builder /root/kubeclipper-console/dist /var/www/kubeclipper-console
