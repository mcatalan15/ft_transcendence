FROM node:23-slim

ENV TZ=Europe/Paris
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN mkdir -p ./public && \
    if [ -d ./static ]; then \
      find ./static -mindepth 1 -maxdepth 1 -exec mv -t ./public {} +; \
    fi

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]