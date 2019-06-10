FROM node:8.16.0-alpine

WORKDIR /usr/app

COPY . .

RUN npm install && npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
