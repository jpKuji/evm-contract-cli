const { ethers } = require('ethers');

// Parse function signature for manual ABI creation
function parseFunctionSignature(signature) {
    const match = signature.match(/^(\w+)\((.*)\)$/);
    if (!match) {
        throw new Error('Invalid function signature format. Expected: functionName(type1,type2,...)');
    }
    
    const [, name, paramsStr] = match;
    const inputs = paramsStr.split(',').map(param => param.trim()).filter(p => p).map((param, index) => ({
        name: `param${index}`,
        type: param
    }));
    
    return {
        name,
        type: 'function',
        inputs,
        outputs: [],
        stateMutability: 'nonpayable'
    };
}

// Parse parameter based on type
function parseParameter(value, type) {
    if (type.includes('[]')) {
        // Array type
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return value.split(',').map(v => v.trim());
        }
    } else if (type.startsWith('uint') || type.startsWith('int')) {
        // Integer type
        return ethers.getBigInt(value);
    } else if (type === 'bool') {
        // Boolean type
        return value.toLowerCase() === 'true';
    } else if (type === 'bytes' || type.startsWith('bytes')) {
        // Bytes type
        return ethers.getBytes(value);
    } else {
        // Default to string/address
        return value;
    }
}

// Get function from ABI
function getFunctionFromABI(abi, functionName) {
    const func = abi.find(item => 
        item.type === 'function' && 
        item.name === functionName
    );
    
    if (!func) {
        throw new Error(`Function ${functionName} not found in ABI`);
    }
    
    return func;
}

// Get all functions from ABI
function getAllFunctionsFromABI(abi) {
    return abi.filter(item => item.type === 'function');
}

module.exports = {
    parseFunctionSignature,
    parseParameter,
    getFunctionFromABI,
    getAllFunctionsFromABI
};
