FROM node:20-bullseye-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

RUN apt update && apt install -y ffmpeg

CMD ["npm", "run", "start:prod"]