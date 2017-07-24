FROM node:6.11-alpine

RUN apk update \
  && apk add ca-certificates wget gettext \
  && update-ca-certificates
