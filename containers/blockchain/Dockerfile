FROM node:18-alpine

WORKDIR /usr/src/app

# Install essential build tools
RUN apk add --no-cache python3 make g++ git

# Create directory structure
RUN mkdir -p contracts scripts

# First copy only package files
COPY package*.json ./
COPY hardhat.config.js ./

# Install dependencies
RUN npm install --include=dev \
    hardhat \
    @nomicfoundation/hardhat-toolbox \
    dotenv

# Now copy contract and script files
COPY contracts/GameContract.sol ./contracts/
COPY scripts/deploy.js ./scripts/

# Create .env template
RUN if [ ! -f .env ]; then \
    echo "PRIVATE_KEY=" > .env && \
    echo "FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc" >> .env; \
    fi

EXPOSE 3002

CMD ["npm", "run", "deploy"]