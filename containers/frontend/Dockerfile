FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

VOLUME /public
RUN cp -r public/* /public

CMD ["echo", "Frontend built"]