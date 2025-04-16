FROM node:16

WORKDIR /app

COPY package*.json ./

# CSS Tailwind and dependencies
RUN npm install tailwindcss postcss autoprefixer

COPY . .

RUN npm run build

CMD ["echo", "Frontend built"]