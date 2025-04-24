FROM node:23-slim

WORKDIR /app

COPY package*.json ./

# CSS Tailwind and dependencies
RUN npm install tailwindcss postcss autoprefixer pixi.js \
	&& npm install --save-dev @types/google.accounts


COPY . .

RUN npm run build

CMD ["echo", "Frontend built"]