require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const { ethers } = require('ethers');
const solc = require('solc');

// Initialize connection
const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let contractAddress = null;

// Simple Tournament contract source
const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tournament {
    uint public teamAScore;
    uint public teamBScore;
    
    constructor(uint _teamA, uint _teamB) {
        teamAScore = _teamA;
        teamBScore = _teamB;
    }
    
    function getScores() public view returns (uint, uint) {
        return (teamAScore, teamBScore);
    }
}
`;

fastify.get('/', async(request, reply) => {
    return {
        message: 'Blockchain service is running',
        endpoints: {
            deploy: 'POST /deploy',
            health: 'GET /health'
        }
    };
});

fastify.post('/deploy', async (request, reply) => {
    const { teamA, teamB } = request.body;
    
    if (typeof teamA !== 'number' || typeof teamB !== 'number') {
        return reply.status(400).send({
            success: false,
            error: 'Both team scores must be numbers'
        });
    }

    try {
        // Compile contract
        const input = {
            language: 'Solidity',
            sources: { 'Tournament.sol': { content: contractSource } },
            settings: { outputSelection: { '*': { '*': ['*'] } } }
        };
        
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        const contract = output.contracts['Tournament.sol']['Tournament'];

        // Deploy contract
        const factory = new ethers.ContractFactory(
            contract.abi,
            contract.bytecode,
            wallet
        );

        const deployedContract = await factory.deploy(teamA, teamB);
        contractAddress = deployedContract.address;
        
        // Wait for deployment to complete
        await deployedContract.deployTransaction.wait(1); // 1 confirmation
        
        return {
            success: true,
            contractAddress,
            transactionHash: deployedContract.deployTransaction.hash
        };
        
    } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
            success: false,
            error: error.message
        });
    }
});

// Start server
fastify.listen({ port: 3002, host: '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log('Blockchain service running on port 3002');
});
