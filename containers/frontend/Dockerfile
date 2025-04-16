FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

VOLUME /app/static

CMD ["echo", "Frontend build complete. Static files are in the volume."]
