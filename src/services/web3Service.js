const { ethers } = require('ethers');
const { NETWORKS } = require('../config/networks');
const { printInfo, printSuccess, printWarning, printError } = require('../utils/logger');

// Setup provider and wallet
function setupProvider(network) {
    if (!NETWORKS[network]) {
        throw new Error(`Unsupported network: ${network}`);
    }
    
    const provider = new ethers.JsonRpcProvider(NETWORKS[network].rpc);
    return provider;
}

// Setup wallet with provider
function setupWallet(provider) {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        throw new Error('MNEMONIC environment variable not set');
    }
    
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
    return wallet;
}

// Setup contract instance
function setupContract(contractAddress, abi, wallet) {
    return new ethers.Contract(contractAddress, abi, wallet);
}

// Validate environment variables
function validateEnvironment() {
    // Check if Alchemy API key is set (required for all networks)
    if (!process.env.ALCHEMY_API_KEY) {
        throw new Error('ALCHEMY_API_KEY environment variable not set');
    }
    
    // Check if mnemonic is set
    if (!process.env.MNEMONIC) {
        throw new Error('MNEMONIC environment variable not set');
    }
}

module.exports = {
    setupProvider,
    setupWallet,
    setupContract,
    validateEnvironment,
    NETWORKS
};
