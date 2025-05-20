FROM node:18-alpine
WORKDIR /usr/src/app

# Install essential build tools
RUN apk add --no-cache python3 make g++ git curl

# Copy package files first for caching
COPY package*.json ./
COPY hardhat.config.js ./

# Install exact versions to prevent conflicts
RUN npm install --include=dev \
    hardhat \
    @nomicfoundation/hardhat-toolbox \
	dotenv
    # express \
    # catapulta \

# Copy application files
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY server.js ./

# Create a health check endpoint
RUN echo 'app.get("/health", (req, res) => { res.status(200).send("OK"); });' >> server.js

# Create a simple env example file with placeholders
RUN echo "FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc" > ./.env.example && \
    echo "BLOCKCHAIN_PRIVATE_KEY=your_private_key_here" >> ./.env.example && \
    echo "PRIVATE_KEY=your_private_key_here" >> ./.env.example

EXPOSE 3002
CMD ["npm", "start"]