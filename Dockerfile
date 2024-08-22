FROM node:14

WORKDIR /app

COPY package*.json ./
COPY server ./server

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]