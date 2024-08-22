FROM node:14

WORKDIR /app

COPY package*.json ./
COPY server ./server

RUN npm install

EXPOSE $PORT

CMD ["npm", "start"]