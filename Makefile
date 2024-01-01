SHELL := /bin/bash

.PHONY: lint-cdk
lint-cdk:
	cd cdk && npm run lint

.PHONY: lint-go
lint-go:
	go fmt ./...

.PHONY: lint
lint: lint-cdk lint-go

.PHONY: unittest-cdk
unittest-cdk:
	cd cdk && npm run test

.PHONY: unittest-go
unittest-go:
	go test ./...

.PHONY: unittest
unittest: unittest-cdk unittest-go

.PHONY: install-cdk
install-cdk:
	cd cdk && npm install

.PHONY: build-cdk
build-cdk:
	cd cdk && npm run cdk -- synth -o ../cdk.out

.PHONY: security
security:
	cfn_nag_scan -i ./cdk.out -t .\*.template.json

.PHONY: install
install: install-cdk

.PHONY: build
build: build-cdk

.PHONY: deploy
deploy:
	cd cdk && cdk deploy