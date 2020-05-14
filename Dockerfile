ARG BASE_IMAGE=node:lts
# use circleci/node when using this image on ci

FROM ${BASE_IMAGE} as env-protoc
ARG ARG_PROTOC_VERSION=3.7.1
ENV PROTOC_VERSION=${ARG_PROTOC_VERSION}

ENV PROTOC_ZIP=protoc-${ARG_PROTOC_VERSION}-linux-x86_64.zip
USER root
RUN curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${PROTOC_ZIP}
RUN unzip -o ${PROTOC_ZIP} -d /usr/local bin/protoc
RUN unzip -o ${PROTOC_ZIP} -d /usr/local 'include/*'
RUN rm -f $PROTOC_ZIP

RUN protoc --version
