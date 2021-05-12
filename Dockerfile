FROM node:14.16.1-alpine3.12

LABEL version="0.1"
LABEL description="API handling interactiong with Amazon QLDB"

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]