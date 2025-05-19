FROM node:18-alpine
WORKDIR /usr/src/app

# Install essential build tools
RUN apk add --no-cache python3 make g++ git curl

# Copy package files first for caching
COPY package*.json ./
COPY hardhat.config.js ./

# Install exact versions to prevent conflicts
RUN npm install --include=dev \
    express \
    hardhat \
    @nomicfoundation/hardhat-toolbox \
    catapulta \
	dotenv

# Copy application files
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY server.js ./

# Create a health check endpoint
RUN echo 'app.get("/health", (req, res) => { res.status(200).send("OK"); });' >> server.js

# Add a startup script to verify environment variables
# Create a simple env example file with placeholders
RUN echo "FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc" > ./.env.example && \
    echo "BLOCKCHAIN_PRIVATE_KEY=your_private_key_here" >> ./.env.example && \
    echo "PRIVATE_KEY=your_private_key_here" >> ./.env.example
RUN echo '#!/bin/sh' > /usr/src/app/startup.sh && \
    echo 'echo "RPC URL: $FUJI_RPC_URL"' >> /usr/src/app/startup.sh && \
    echo 'echo "Private key exists: $([ -n "$BLOCKCHAIN_PRIVATE_KEY" ] && echo true || echo false)"' >> /usr/src/app/startup.sh && \
    echo 'echo "===== Starting blockchain service ====="' >> /usr/src/app/startup.sh && \
    echo 'npm start' >> /usr/src/app/startup.sh && \
    chmod +x /usr/src/app/startup.sh

EXPOSE 3002
CMD ["npm", "start"]