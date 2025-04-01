FROM node:18-alpine3.21

RUN apk add --no-cache sqlite sqlite-dev

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's caching
COPY package*.json ./

RUN npm cache clean --force && npm install

COPY . .

RUN chmod +x tools/init_db.sh

EXPOSE 3000

ENTRYPOINT ["sh", "tools/init_db.sh"]