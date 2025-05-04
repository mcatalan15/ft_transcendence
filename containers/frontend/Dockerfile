FROM node:23-slim

ENV TZ=Europe/Paris

WORKDIR /app

COPY package*.json ./

RUN npm install tailwindcss postcss autoprefixer pixi.js vite \
	&& npm install --save-dev @types/google.accounts i18next i18next-browser-languagedetector

COPY . .

RUN npm run build

CMD ["echo", "Frontend built"]