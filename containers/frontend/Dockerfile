FROM node:23-slim

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV TZ=Europe/Paris

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# Use different commands based on environment
CMD if [ "$NODE_ENV" = "production" ]; then echo "Frontend built"; else npm run dev -- --host 0.0.0.0 --port 5173; fi