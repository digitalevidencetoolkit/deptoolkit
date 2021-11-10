FROM node:16.13.0-alpine3.14

LABEL version="0.1"
LABEL description="API handling interactiong with Amazon QLDB"

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]