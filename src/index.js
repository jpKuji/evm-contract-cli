#!/usr/bin/env node

const { question, close } = require('./utils/input');
const { printInfo, printSuccess, printWarning, printError } = require('./utils/logger');
const { parseFunctionSignature } = require('./utils/abi');
const { loadABI, selectFunction } = require('./services/abiService');
const { executeContractFunction, collectParameters } = require('./services/contractService');
const { setupProvider, setupWallet, setupContract, validateEnvironment, NETWORKS } = require('./services/web3Service');

// Main contract interaction function
async function interactWithContract(network, contractAddress, abiFile, functionName) {
    try {
        // Validate environment
        validateEnvironment();
        
        // Setup provider and wallet
        const provider = setupProvider(network);
        const wallet = setupWallet(provider);
        
        printInfo(`Connected to ${NETWORKS[network].name}`);
        printInfo(`Using wallet address: ${wallet.address}`);
        
        let functionABI;
        let contract;
        
        if (abiFile) {
            // Load ABI from file
            const abi = loadABI(abiFile);
            
            // Let user select function from ABI
            functionABI = await selectFunction(abi);
            contract = setupContract(contractAddress, abi, wallet);
        } else {
            // Manual function signature
            const signature = await question('Enter function signature (e.g., transfer(address,uint256)): ');
            functionABI = parseFunctionSignature(signature);
            contract = setupContract(contractAddress, [functionABI], wallet);
        }
        
        printInfo(`Function: ${functionABI.name}`);
        printInfo(`Parameters: ${functionABI.inputs.length}`);
        
        // Collect parameters
        const parameters = await collectParameters(functionABI);
        
        // Execute the contract function
        const result = await executeContractFunction(
            contract, 
            functionABI, 
            parameters, 
            wallet, 
            contractAddress, 
            provider
        );
        
        // Output transaction hash if it's a transaction
        if (result && result.hash) {
            console.log(result.hash);
        }
        
    } catch (error) {
        printError(`Error: ${error.message}`);
        process.exit(1);
    } finally {
        close();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
    printError('Usage: node index.js <network> <contract-address> <abi-file> <function-name>');
    process.exit(1);
}

const [network, contractAddress, abiFile, functionName] = args;

// Run the interaction
interactWithContract(network, contractAddress, abiFile, functionName);
