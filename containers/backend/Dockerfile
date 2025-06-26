FROM node:20-alpine

ENV TZ=Europe/Paris

RUN apk add --no-cache sqlite python3

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's caching
COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x tools/init_db.sh tools/data.py

RUN mkdir -p /usr/src/app/public/avatars/defaults /usr/src/app/public/avatars/uploads

EXPOSE 3100

RUN npm run build

ENTRYPOINT ["sh", "tools/init_db.sh"]