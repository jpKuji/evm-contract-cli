# Constants Directory

This directory contains predefined contract addresses for easy selection during contract interaction.

## addresses.json

Contains contract addresses organized by network. The format is:

```json
{
  "network_name": {
    "Label": "contract_address",
    "Another Label": "another_contract_address"
  }
}
```

### Supported Networks

- `ethereum` - Ethereum Mainnet
- `avalanche` - Avalanche C-Chain
- `base` - Base Mainnet

### Usage

When running the contract interaction tool, you can select from predefined addresses:

```bash
Available contract addresses for ethereum:
1) USDC - 0xA0b86a33E6441e07e6c87EA79E6a4b2b3c6A6d8b
2) USDT - 0xdAC17F958D2ee523a2206206994597C13D831ec7
3) WETH - 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
4) THORChain Router - 0xD37BbE5744D730a1d98d8DC97c42F0Ca46aD7146
5) Custom address

Select contract address (1-5): 1
```

### Adding New Addresses

To add new contract addresses:

1. Open `addresses.json`
2. Add your contract under the appropriate network:
   ```json
   {
     "ethereum": {
       "My Contract": "0x1234567890123456789012345678901234567890"
     }
   }
   ```
3. Save the file

### Custom Addresses

You can always select "Custom address" to input any contract address manually, even if it's not in the predefined list.

## Tips

- Use descriptive labels for your contracts
- Double-check addresses before adding them
- Consider adding comments in the JSON for complex contracts
- Keep addresses updated if contracts are upgraded
