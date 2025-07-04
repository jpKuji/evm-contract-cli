// Network configurations for different blockchains
const NETWORKS = {
    ethereum: {
        name: 'Ethereum Mainnet',
        rpc: process.env.ETHEREUM_RPC || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 1
    },
    avalanche: {
        name: 'Avalanche C-Chain',
        rpc: process.env.AVALANCHE_RPC || `https://avax-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 43114
    },
    base: {
        name: 'Base Mainnet',
        rpc: process.env.BASE_RPC || `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 8453
    }
};

module.exports = {
    NETWORKS
};
