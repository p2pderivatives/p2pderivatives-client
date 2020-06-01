
ARG BASE_IMAGE_TAG=lts-buster
# version including browers, use tag lts-buster-browsers

FROM circleci/node:${BASE_IMAGE_TAG} as env-protoc
ARG ARG_PROTOC_VERSION=3.7.1
ENV PROTOC_VERSION=${ARG_PROTOC_VERSION}

ENV PROTOC_ZIP=protoc-${ARG_PROTOC_VERSION}-linux-x86_64.zip
USER root
RUN curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${PROTOC_ZIP} \
    && unzip -o ${PROTOC_ZIP} -d /usr/local bin/protoc \
    && unzip -o ${PROTOC_ZIP} -d /usr/local 'include/*' \
    && rm -f $PROTOC_ZIP

USER circleci
RUN protoc --version

FROM env-protoc as global-deps
ENV NPM_PACKAGES="/home/circleci/.npm-packages"
ENV NODE_PATH=${NPM_PACKAGES}/lib/node_modules:$NODE_PATH
RUN mkdir ${NPM_PACKAGES}
RUN sudo npm config -g set prefix ${NPM_PACKAGES}
RUN npm install -g node-gyp
RUN npm install -g grpc@1.24.2
RUN npm install -g \
    electron@7.0.0 \
    typescript \
    grpc-tools@^1.8.1 \
    grpc_tools_node_protoc_ts \
    && npm install -g grpc --target=7.0.0 --runtime=electron
