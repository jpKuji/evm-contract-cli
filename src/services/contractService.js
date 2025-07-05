const { ethers } = require('ethers');
const { question } = require('../utils/input');
const { printInfo, printSuccess, printWarning, printError } = require('../utils/logger');
const { parseParameter } = require('../utils/abi');
const { checkAndHandleAllowances } = require('./tokenService');

// Execute a contract function call or transaction
async function executeContractFunction(contract, functionABI, parameters, wallet, contractAddress, provider) {
    // Show transaction summary
    console.log('\n=== Transaction Summary ===');
    console.log(`Network: ${provider.network?.name || 'Unknown'}`);
    console.log(`Contract: ${contractAddress}`);
    console.log(`Function: ${functionABI.name}`);
    console.log(`State Mutability: ${functionABI.stateMutability || 'nonpayable'}`);
    
    // Handle BigInt serialization for display
    const displayParameters = parameters.map(param => 
        typeof param === 'bigint' ? param.toString() : param
    );
    console.log(`Parameters: ${JSON.stringify(displayParameters)}`);
    
    // Check if this is a view function - if so, offer to call it instead
    if (functionABI.stateMutability === 'view' || functionABI.stateMutability === 'pure') {
        console.log('\nThis is a view function. Would you like to:');
        console.log('1) Call it (no gas cost, read-only)');
        console.log('2) Send as transaction anyway');
        
        const viewChoice = await question('Choose option (1-2): ');
        if (viewChoice === '1') {
            return await executeViewFunction(contract, functionABI, parameters);
        }
    }
    
    const confirm = await question('\nProceed with transaction? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
        printInfo('Transaction cancelled');
        return null;
    }        // Check token allowances if this might involve ERC20 tokens
        if (functionABI.stateMutability !== 'view' && functionABI.stateMutability !== 'pure') {
            printInfo('Checking token allowances...');
            try {
                await checkAndHandleAllowances(functionABI, parameters, wallet, contractAddress, provider);
                printSuccess('Token allowance check completed successfully.');
            } catch (allowanceError) {
                printError(`Token allowance check failed: ${allowanceError.message}`);
                
                const retryChoice = await question('Would you like to proceed anyway? (y/N): ');
                if (retryChoice.toLowerCase() !== 'y') {
                    printInfo('Transaction cancelled due to allowance issues.');
                    return null;
                }
                printWarning('Proceeding without proper allowances. Transaction may fail.');
            }
        }
    
    return await executeTransaction(contract, functionABI, parameters, provider);
}

// Execute a view function call
async function executeViewFunction(contract, functionABI, parameters) {
    try {
        printInfo('Calling view function...');
        const result = await contract[functionABI.name](...parameters);
        printSuccess('Call successful!');
        console.log('Result:', result.toString());
        return result;
    } catch (error) {
        printError(`Call failed: ${error.message}`);
        throw error;
    }
}

// Execute a transaction
async function executeTransaction(contract, functionABI, parameters, provider) {
    try {
        // Estimate gas
        printInfo('Estimating gas...');
        const gasEstimate = await contract[functionABI.name].estimateGas(...parameters);
        printInfo(`Estimated gas: ${gasEstimate.toString()}`);
        
        // Get gas price
        const feeData = await provider.getFeeData();
        printInfo(`Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
        
        // Send transaction
        printInfo('Sending transaction...');
        const tx = await contract[functionABI.name](...parameters, {
            gasLimit: gasEstimate,
            gasPrice: feeData.gasPrice
        });
        
        printSuccess(`Transaction sent: ${tx.hash}`);
        
        // Wait for confirmation
        printInfo('Waiting for confirmation...');
        const receipt = await tx.wait();
        
        printSuccess(`Transaction confirmed in block: ${receipt.blockNumber}`);
        printSuccess(`Gas used: ${receipt.gasUsed.toString()}`);
        
        return tx;
        
    } catch (gasError) {
        printError('Gas estimation failed. This usually means the transaction would revert.');
        printError(`Error details: ${gasError.message}`);
        
        // Try to get more detailed error information
        if (gasError.code === 'CALL_EXCEPTION') {
            printInfo('Common causes:');
            printInfo('1. Invalid parameters (check types and values)');
            printInfo('2. Insufficient balance or allowance');
            printInfo('3. Contract state doesn\'t allow this operation');
            printInfo('4. Access control - you may not have permission');
            printInfo('5. Contract is paused or has restrictions');
            
            // Display transaction details for debugging
            console.log('\n=== Transaction Debug Info ===');
            console.log(`Function: ${functionABI.name}`);
            console.log(`Parameters:`, parameters.map(p => typeof p === 'bigint' ? p.toString() : p));
            console.log(`From: ${contract.runner.address}`);
            console.log(`To: ${contract.target}`);
            
            // Check wallet balance
            try {
                const balance = await provider.getBalance(contract.runner.address);
                console.log(`Wallet ETH balance: ${ethers.formatEther(balance)} ETH`);
            } catch (e) {
                console.log('Could not check wallet balance');
            }
        }
        
        throw gasError;
    }
}

// Collect parameters from user input
async function collectParameters(functionABI) {
    const parameters = [];
    
    for (let i = 0; i < functionABI.inputs.length; i++) {
        const input = functionABI.inputs[i];
        const paramName = input.name || `param${i}`;
        const paramType = input.type;
        
        console.log(`\nParameter ${i + 1}:`);
        console.log(`  Name: ${paramName}`);
        console.log(`  Type: ${paramType}`);
        
        const value = await question(`Enter value for ${paramName} (${paramType}): `);
        
        try {
            const parsedValue = parseParameter(value, paramType);
            parameters.push(parsedValue);
            // Handle BigInt serialization for display
            const displayValue = typeof parsedValue === 'bigint' ? parsedValue.toString() : parsedValue;
            printInfo(`Parsed: ${JSON.stringify(displayValue)}`);
        } catch (error) {
            printError(`Error parsing parameter: ${error.message}`);
            throw error;
        }
    }
    
    return parameters;
}

module.exports = {
    executeContractFunction,
    executeViewFunction,
    executeTransaction,
    collectParameters
};
