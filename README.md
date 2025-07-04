# Contract Interaction Tool

A robust, interactive tool for interacting with smart contracts on Avalanche, Base, and Ethereum networks.

## Features

- **Multi-Network Support**: Ethereum, Avalanche C-Chain, and Base Mainnet
- **Interactive Interface**: User-friendly shell script with guided prompts
- **ABI Management**: Support for ABI files or manual function signatures
- **Token Allowances**: Automatic ERC20 token allowance checking and approval
- **Contract Address Management**: Predefined contract addresses with custom option
- **Error Handling**: Comprehensive error reporting and debugging
- **Environment Security**: Secure handling of mnemonics and API keys

## Project Structure

```
vibe-tools/
├── contract-interact.sh          # Main entry point shell script
├── src/
│   ├── index.js                 # Main Node.js application
│   ├── config/
│   │   └── networks.js          # Network configurations
│   ├── utils/
│   │   ├── logger.js            # Colored logging utilities
│   │   ├── input.js             # User input handling
│   │   └── abi.js               # ABI parsing utilities
│   └── services/
│       ├── web3Service.js       # Web3 provider and wallet setup
│       ├── abiService.js        # ABI loading and function selection
│       ├── contractService.js   # Contract interaction logic
│       └── tokenService.js      # ERC20 token allowance management
├── scripts/
│   ├── utils.sh                 # Shell utility functions
│   ├── checks.sh                # Prerequisite checks
│   └── selections.sh            # Interactive selection functions
├── constants/
│   └── addresses.json           # Predefined contract addresses
├── abis/                        # ABI files directory
├── .env                         # Environment variables (not in git)
├── .gitignore                   # Git ignore rules
└── package.json                 # Node.js dependencies
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd vibe-tools
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```bash
   MNEMONIC="your 24-word mnemonic phrase here"
   ALCHEMY_API_KEY="your-alchemy-api-key-here"
   ```

4. **Make the script executable**
   ```bash
   chmod +x contract-interact.sh
   ```

## Usage

### Basic Usage

Run the interactive tool:

```bash
./contract-interact.sh
```

The tool will guide you through:

1. Network selection (Ethereum, Avalanche, Base)
2. Contract address selection (from constants or custom)
3. ABI file selection or manual function signature
4. Function parameter input
5. Transaction execution with allowance checking

### Direct Node.js Usage

You can also run the Node.js application directly:

```bash
node src/index.js <network> <contract-address> <abi-file> <function-name>
```

## Configuration

### Networks

Supported networks are configured in `src/config/networks.js`:

- Ethereum Mainnet
- Avalanche C-Chain
- Base Mainnet

### Contract Addresses

Add frequently used contract addresses to `constants/addresses.json`:

```json
{
  "ethereum": {
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  },
  "avalanche": {
    "USDC": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
  },
  "base": {
    "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }
}
```

### ABI Files

Place your ABI files in the `abis/` directory as `.json` files. The tool will automatically detect and list them for selection.

## Environment Variables

- `MNEMONIC`: Your 24-word seed phrase for wallet access
- `ALCHEMY_API_KEY`: Your Alchemy API key for RPC access
- `ETHEREUM_RPC` (optional): Custom Ethereum RPC URL
- `AVALANCHE_RPC` (optional): Custom Avalanche RPC URL
- `BASE_RPC` (optional): Custom Base RPC URL

## Security

- Environment variables are loaded from `.env` file
- `.env` file is automatically ignored by git
- Mnemonic phrases are handled securely in memory
- No sensitive data is logged or exposed

## Error Handling

The tool provides comprehensive error handling:

- Gas estimation failures with common causes
- Invalid parameter detection
- Insufficient balance warnings
- Token allowance management
- Network connectivity issues

## Token Allowances

The tool automatically:

- Detects ERC20 token parameters in function calls
- Checks current allowances vs required amounts
- Prompts for approval if needed
- Offers exact or unlimited approval options
- Verifies approval transactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the modular structure
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
vibe-tools/
├── contract-interact.sh # Main interactive shell script
├── contract-interact.js # Node.js contract interaction logic
├── package.json # Dependencies
├── abis/ # Directory for ABI files
│ ├── erc20.json # Example ERC-20 ABI
│ └── your-contract.json # Your contract ABIs
└── README.md # This file

````

## ABI Files

Place your contract ABI files in the `abis/` directory. The script accepts relative paths:

- `abis/mycontract.json`
- `contracts/MyContract.json`

## Network Configuration

The script comes with pre-configured RPC endpoints:

- **Ethereum**: Uses public RPC (you may want to replace with your own)
- **Avalanche**: Uses official Avalanche RPC
- **Base**: Uses official Base RPC

To update RPC endpoints, edit the `NETWORKS` object in `contract-interact.js`.

## Parameter Types

The script supports all Solidity types:

- **Basic types**: `uint256`, `int256`, `address`, `bool`, `bytes`
- **Fixed-size arrays**: `uint256[5]`, `address[3]`
- **Dynamic arrays**: `uint256[]`, `address[]`
- **Strings**: `string`
- **Bytes**: `bytes`, `bytes32`

### Parameter Input Examples

- **Address**: `0x742d35Cc6634C0532925a3b8D6D0d1a8C1e8c0A8`
- **Uint256**: `1000000000000000000` (1 ETH in wei)
- **Array**: `["0x123...", "0x456..."]` or `address1,address2,address3`
- **Boolean**: `true` or `false`

## Example Usage

### With ABI File

```bash
./contract-interact.sh
# Select network: 1 (Ethereum)
# Contract address: 0x742d35Cc6634C0532925a3b8D6D0d1a8C1e8c0A8
# ABI option: 1 (Yes, I have an ABI file)
# ABI file path: abis/mycontract.json
# Function name: transfer
# Parameter 1 (to): 0x123...
# Parameter 2 (amount): 1000000000000000000
````

### Without ABI File

```bash
./contract-interact.sh
# Select network: 2 (Avalanche)
# Contract address: 0x742d35Cc6634C0532925a3b8D6D0d1a8C1e8c0A8
# ABI option: 2 (No, provide function signature)
# Function signature: transfer(address,uint256)
# Parameter 1 (to): 0x123...
# Parameter 2 (amount): 1000000000000000000
```

## Output

The script provides detailed information during execution and outputs the transaction hash upon successful completion:

```
[INFO] Connected to Ethereum Mainnet
[INFO] Using wallet address: 0x...
[INFO] Estimating gas...
[INFO] Estimated gas: 21000
[INFO] Sending transaction...
[SUCCESS] Transaction sent: 0x1234567890abcdef...
[SUCCESS] Transaction confirmed in block: 12345678
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Security Notes

- Never commit your mnemonic to version control
- Use environment variables for sensitive data
- Consider using a hardware wallet for production use
- Always verify contract addresses and function parameters

## Troubleshooting

### Common Issues

1. **"MNEMONIC environment variable not set"**

   - Set your mnemonic: `export MNEMONIC="your mnemonic here"`

2. **"Invalid function signature format"**

   - Ensure format is: `functionName(type1,type2,...)`
   - Example: `transfer(address,uint256)`

3. **"Gas estimation failed"**

   - Check contract address and function parameters
   - Ensure you have sufficient balance

4. **"Transaction failed"**
   - Verify contract state and requirements
   - Check if function exists and parameters are correct

## License

MIT License - feel free to modify and distribute as needed.
