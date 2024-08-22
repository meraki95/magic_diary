FROM node:14

WORKDIR /app

COPY server ./server

WORKDIR /app/server

RUN npm install

RUN npm run build

EXPOSE $PORT

CMD ["node", "server.js"]