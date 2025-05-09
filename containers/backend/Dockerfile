FROM node:18-alpine3.21

ENV TZ=Europe/Paris

RUN apk add --no-cache sqlite

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's caching
COPY package*.json ./

RUN npm cache clean --force \
	&& npm install fastify@^5.0.0 \
	pino-pretty \
	sqlite3 \
	fastify-multipart \
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
	jsonwebtoken \
	nodemailer \
	@sendgrid/mail

COPY . .

RUN chmod +x tools/init_db.sh

EXPOSE 3100

ENTRYPOINT ["sh", "tools/init_db.sh"]