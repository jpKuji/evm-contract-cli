const { ethers } = require('ethers');
const { question } = require('../utils/input');
const { printInfo, printSuccess, printWarning, printError } = require('../utils/logger');

// Standard ERC20 ABI for allowance and approve functions
const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

// Check if an address is likely a token address by checking for ERC20 functions
async function isTokenAddress(address, provider) {
    try {
        const contract = new ethers.Contract(address, ERC20_ABI, provider);
        // Try to call decimals() - if it works, it's likely an ERC20 token
        await contract.decimals();
        return true;
    } catch {
        return false;
    }
}

// Check and handle token allowances
async function checkAndHandleAllowances(functionABI, parameters, wallet, contractAddress, provider) {
    const tokenAddresses = [];
    const amounts = [];
    
    // Scan parameters for potential token addresses and amounts
    for (let i = 0; i < functionABI.inputs.length; i++) {
        const input = functionABI.inputs[i];
        const param = parameters[i];
        
        // Check if this looks like a token address parameter
        if (input.type === 'address' && typeof param === 'string' && param.startsWith('0x')) {
            const isToken = await isTokenAddress(param, provider);
            if (isToken) {
                // Look for amount parameters (usually uint256 types after address)
                for (let j = i + 1; j < functionABI.inputs.length; j++) {
                    const nextInput = functionABI.inputs[j];
                    if (nextInput.type.includes('uint') && typeof parameters[j] === 'bigint') {
                        tokenAddresses.push(param);
                        amounts.push(parameters[j]);
                        break;
                    }
                }
            }
        }
    }
    
    // Check allowances for each token found
    for (let i = 0; i < tokenAddresses.length; i++) {
        const tokenAddress = tokenAddresses[i];
        const amount = amounts[i];
        
        await checkAndApproveToken(tokenAddress, contractAddress, amount, wallet, provider);
    }
}

// Check and approve token allowance if needed
async function checkAndApproveToken(tokenAddress, spenderAddress, amount, wallet, provider) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        
        // Get token info
        const [symbol, decimals, balance, allowance] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals(),
            tokenContract.balanceOf(wallet.address),
            tokenContract.allowance(wallet.address, spenderAddress)
        ]);
        
        const amountFormatted = ethers.formatUnits(amount, decimals);
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        const allowanceFormatted = ethers.formatUnits(allowance, decimals);
        
        printInfo(`Token: ${symbol} (${tokenAddress})`);
        printInfo(`Your balance: ${balanceFormatted} ${symbol}`);
        printInfo(`Required amount: ${amountFormatted} ${symbol}`);
        printInfo(`Current allowance: ${allowanceFormatted} ${symbol}`);
        
        // Check if user has enough balance
        if (balance < amount) {
            printError(`Insufficient ${symbol} balance. You need ${amountFormatted} ${symbol} but only have ${balanceFormatted} ${symbol}`);
            throw new Error(`Insufficient ${symbol} balance`);
        }
        
        // Check if allowance is sufficient
        if (allowance < amount) {
            printWarning(`Insufficient allowance for ${symbol}. Need to approve ${amountFormatted} ${symbol} for contract ${spenderAddress}`);
            
            console.log('\nAllowance options:');
            console.log(`1) Approve exact amount (${amountFormatted} ${symbol})`);
            console.log(`2) Approve unlimited amount (saves gas on future transactions)`);
            console.log('3) Skip approval (transaction will likely fail)');
            
            const approvalChoice = await question('Choose approval option (1-3): ');
            
            if (approvalChoice === '3') {
                printWarning('Skipping approval. Transaction may fail due to insufficient allowance.');
                return;
            }
            
            const approvalAmount = approvalChoice === '2' ? 
                ethers.MaxUint256 : // Unlimited approval
                amount; // Exact amount
            
            const approvalAmountFormatted = approvalChoice === '2' ? 
                'unlimited' : 
                ethers.formatUnits(approvalAmount, decimals);
            
            printInfo(`Approving ${approvalAmountFormatted} ${symbol} for ${spenderAddress}...`);
            
            // Send approval transaction
            const approveTx = await tokenContract.approve(spenderAddress, approvalAmount);
            printInfo(`Approval transaction sent: ${approveTx.hash}`);
            
            // Wait for approval confirmation
            printInfo('Waiting for approval confirmation...');
            const approvalReceipt = await approveTx.wait();
            printSuccess(`Approval confirmed in block: ${approvalReceipt.blockNumber}`);
            
            // Verify new allowance
            const newAllowance = await tokenContract.allowance(wallet.address, spenderAddress);
            const newAllowanceFormatted = newAllowance === ethers.MaxUint256 ? 
                'unlimited' : 
                ethers.formatUnits(newAllowance, decimals);
            printSuccess(`New allowance: ${newAllowanceFormatted} ${symbol}`);
        } else {
            printSuccess(`Sufficient allowance: ${allowanceFormatted} ${symbol} >= ${amountFormatted} ${symbol}`);
        }
        
    } catch (error) {
        if (error.message.includes('Insufficient')) {
            throw error; // Re-throw balance errors
        }
        printWarning(`Could not check allowance for ${tokenAddress}: ${error.message}`);
        printWarning('This might not be an ERC20 token or there might be a network issue.');
    }
}

module.exports = {
    ERC20_ABI,
    isTokenAddress,
    checkAndHandleAllowances,
    checkAndApproveToken
};
