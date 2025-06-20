FROM node:18-alpine3.21

ENV TZ=Europe/Paris

RUN apk add --no-cache sqlite python3

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's caching
COPY package*.json ./

RUN npm cache clean --force \
	&& npm install fastify@^5.0.0 \
	typescript @types/node ts-node \
	pino-pretty \
	sqlite3 \
	@fastify/multipart \
	bcrypt \
	@fastify/cors \
	@fastify/under-pressure \
	prom-client \
	google-auth-library \
	nodemon \
	@fastify/cookie \
	@fastify/session \
	@fastify/swagger \
	@fastify/swagger-ui \
	otplib \
	qrcode \
	jsonwebtoken \
	redis \
	ws \
	vim

COPY . .

RUN chmod +x tools/init_db.sh tools/data.py

RUN mkdir -p /usr/src/app/public/avatars/defaults /usr/src/app/public/avatars/uploads

EXPOSE 3100

RUN npm run build

ENTRYPOINT ["sh", "tools/init_db.sh"]