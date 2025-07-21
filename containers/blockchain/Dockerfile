FROM node:18-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++ git curl

COPY package*.json ./

RUN npm install --include=dev

COPY hardhat.config.js ./

COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY server.js ./

RUN echo 'app.get("/health", (req, res) => { res.status(200).send("OK"); });' >> server.js

RUN echo "FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc" > ./.env.example && \
    echo "BLOCKCHAIN_PRIVATE_KEY=your_private_key_here" >> ./.env.example && \
    echo "PRIVATE_KEY=your_private_key_here" >> ./.env.example

EXPOSE 3002
CMD ["npm", "start"]