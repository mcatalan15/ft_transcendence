FROM node:18-alpine

WORKDIR /usr/src/app

# Install ONLY essential dependencies
RUN npm install -g solc@0.8.0 @avalabs/avalanchejs ethers

# Copy necessary files
COPY package.json .
COPY contracts/ ./contracts/
COPY src/ ./src/

# Install project dependencies
RUN npm install

# Compile contracts directly with solc
RUN solcjs --bin --abi --include-path node_modules/ --base-path . contracts/Tournament.sol -o build/

EXPOSE 3001
CMD ["node", "src/index.html"] #was index.js but we're using html

