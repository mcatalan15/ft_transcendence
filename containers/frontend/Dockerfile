FROM node:23-slim

ENV TZ=Europe/Paris

WORKDIR /app

COPY package*.json ./

RUN npm install tailwindcss postcss autoprefixer pixi.js vite i18next i18next-http-backend i18next-browser-languagedetector \
	jsonwebtoken cookie-parser \
	&& npm install --save-dev @types/google.accounts @types/i18next

COPY . .

RUN npm run build

CMD ["echo", "Frontend built"]