FROM node:14.16.1-alpine3.12

LABEL version="0.1"
LABEL description="GUI from the QLDB ledger"

WORKDIR /web
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .

EXPOSE 8000
ENV HOST=0.0.0.0

CMD ["npm", "run", "dev"]