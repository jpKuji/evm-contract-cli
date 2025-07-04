const fs = require('fs');
const path = require('path');
const { question } = require('../utils/input');
const { printInfo, printSuccess, printWarning, printError } = require('../utils/logger');
const { getAllFunctionsFromABI } = require('../utils/abi');

// Display functions for selection
async function selectFunction(abi) {
    const functions = getAllFunctionsFromABI(abi);
    
    if (functions.length === 0) {
        throw new Error('No functions found in ABI');
    }
    
    printInfo('Available functions:');
    functions.forEach((func, index) => {
        const params = func.inputs.map(input => `${input.type} ${input.name}`).join(', ');
        const mutability = func.stateMutability === 'view' ? '[VIEW]' : '[WRITE]';
        console.log(`${index + 1}) ${func.name}(${params}) ${mutability}`);
    });
    
    console.log('');
    const choice = await question(`Select function (1-${functions.length}): `);
    const selectedIndex = parseInt(choice) - 1;
    
    if (selectedIndex < 0 || selectedIndex >= functions.length) {
        throw new Error('Invalid function selection');
    }
    
    return functions[selectedIndex];
}

// Load ABI from file
function loadABI(abiFilePath) {
    try {
        const abiPath = path.resolve(abiFilePath);
        const abiContent = fs.readFileSync(abiPath, 'utf8');
        return JSON.parse(abiContent);
    } catch (error) {
        throw new Error(`Failed to load ABI file: ${error.message}`);
    }
}

module.exports = {
    selectFunction,
    loadABI
};
