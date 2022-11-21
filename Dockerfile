############################
# How to build
############################
# In the same directory as package.json
# $ docker build -t kc-console .
# NOTE: must have at least one tag in your repo，otherwise will build failed.
# run cmd [ git describe --tags --dirty --match='v*' --abbrev=14 ] to check

############################
# How to run
############################
# without any config
# $ docker run -d --name kc-console --restart=always --net=host -v /var/log/nginx:/var/log/nginx kc-console:latest
# with your_nginx_file
# $ docker run -d --name kc-console --restart=always --net=host -v /var/log/nginx:/var/log/nginx -v your_nginx_file:/etc/nginx/nginx.conf kc-console:latest

# Setp1. Build dist
FROM --platform=${BUILDPLATFORM} node:12-alpine AS builder

COPY ./ /root/kc-console/
WORKDIR /root/kc-console
RUN apk add python2 make g++ git \
  && yarn config set registry https://registry.npmmirror.com/ \
  && yarn install \
  && yarn run build

# Step2. Put into caddy
FROM --platform=${BUILDPLATFORM} caddy:2.4.6

ARG REPO_URL
ARG BRANCH
ARG COMMIT_REF
LABEL repo-url=$REPO_URL
LABEL branch=$BRANCH
LABEL commit-ref=$COMMIT_REF

COPY --from=builder /root/kc-console/dist /etc/kc-console/dist
