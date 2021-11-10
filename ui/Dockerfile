FROM node:16.13.0-alpine3.14 as builder
LABEL version="0.1"
LABEL description="GUI from the QLDB ledger"

WORKDIR /app
COPY . .
RUN npm install
RUN node node_modules/esbuild/install.js
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /assets

COPY ./default.conf /etc/nginx/conf.d/default.conf