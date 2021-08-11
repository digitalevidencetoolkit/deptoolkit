FROM node:14.16.1-alpine3.12
LABEL version="0.1"
LABEL description="Firefox extension for the DEPToolkit"

WORKDIR /extension
COPY ["package.json", "package-lock.json", "./"]

RUN apk --no-cache add git 
RUN apk --no-cache --virtual build-dependencies add \
  g++ gcc libgcc \
  libstdc++ linux-headers \
  make python3 \
  && npm install \
  && apk del build-dependencies

COPY . .

EXPOSE 9000

CMD ["npm", "run", "watch"]