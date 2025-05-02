FROM node:23-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./

# CSS Tailwind and dependencies
RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["echo", "Frontend built"]