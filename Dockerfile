FROM node:14.8.0-alpine

WORKDIR /server

COPY ./package.json ./

RUN apk update && apk upgrade && apk add --no--cache bash git openssh

RUN npm install

COPY . .

ENV NODE_ENV = production

EXPOSE 8080

CMD ["npm", "run", "server"]