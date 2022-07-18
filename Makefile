SOURCES := src

# Params
MODE ?= prod
BUILD_ENGINE ?= docker
BUILDX ?= false
PLATFORM ?= linux/amd64,linux/arm64

# Version
REPO_URL ?= $(shell git ls-remote --get-url origin)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT ?= $(shell git rev-parse --verify HEAD)

TAG ?= ${GIT_BRANCH}

ifeq (${GIT_BRANCH}, master)
  TAG := latest
endif


docker_file ?= docker/prod.dockerfile

.PHONY: help install lint style test build

help:
	@echo "kubeclipper-console development makefile"
	@echo
	@echo "Usage: make <TARGET>"
	@echo
	@echo "Target:"
	@echo "  install         Installs the project dependencies."
	@echo "  lint            Check JavaScript code style."
	@echo "  style           Format JavaScript code style."
	@echo "  test            Run unit tests."
	@echo "  image           Build docker image."
	@echo

aaa:
	@echo $(RELEASE_VERSION)
	@echo $(GIT_BRANCH)
	@echo $(GIT_COMMIT)

install:
	npm install

lint:
	echo null

style:
	echo null

test:
	echo null

image:
ifeq ($(BUILDX), false)
	docker build \
		--build-arg REPO_URL=$(REPO_URL) \
		--build-arg BRANCH=$(GIT_BRANCH) \
		--build-arg COMMIT_REF=$(GIT_COMMIT) \
		-t caas4/kubeclipper-console:${TAG} \
		-f $(docker_file) .
else
	docker buildx build \
		--no-cache \
		--push \
		--platform $(PLATFORM) \
		--force-rm \
		--build-arg REPO_URL=$(REPO_URL) \
		--build-arg BRANCH=$(GIT_BRANCH) \
		--build-arg COMMIT_REF=$(GIT_COMMIT) \
		-t caas4/kubeclipper-console:${TAG} \
		-f $(docker_file) .
endif
