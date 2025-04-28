FROM node:16

WORKDIR /app

COPY package*.json ./

# CSS Tailwind and dependencies
RUN npm install tailwindcss postcss autoprefixer \
	&& npm install --save-dev @types/google.accounts


COPY . .

RUN npm run build

CMD ["echo", "Frontend built"]