FROM node:18-alpine

WORKDIR /usr/src/app

# Install essential build tools
RUN apk add --no-cache python3 make g++ git curl

# Copy package files first for caching
COPY package*.json ./
COPY hardhat.config.js ./

# Install exact versions to prevent conflicts
RUN npm install --include=dev \
	express --save \
	hardhat \
    @nomicfoundation/hardhat-toolbox \
    dotenv

# Copy application files
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY server.js ./

EXPOSE 3002
CMD ["npm", "start"]