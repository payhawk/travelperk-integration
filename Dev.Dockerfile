FROM node:12

WORKDIR /app
RUN chmod -R 777 /app

USER node

EXPOSE 8080 8050 9230
ENTRYPOINT [ "npm", "start" ]

COPY ["./package.json", "./package-lock.json", "./"]
RUN npm ci

ADD . ./
RUN npm run compile
