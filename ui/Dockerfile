FROM node:14.16.1-alpine3.12

LABEL version="0.1"
LABEL description="GUI from the QLDB ledger"

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .
RUN node node_modules/esbuild/install.js
RUN npm run build

FROM mhart/alpine-node:slim-12

WORKDIR /app
COPY --from=0 /app .
COPY . .

ENV PORT=8000
EXPOSE 8000
CMD ["node", "build"]
