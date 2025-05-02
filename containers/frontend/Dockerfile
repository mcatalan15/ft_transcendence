FROM node:23-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./

RUN npm install tailwindcss postcss autoprefixer pixi.js vite \
	&& npm install --save-dev @types/google.accounts

# CSS Tailwind and dependencies
RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["echo", "Frontend built"]