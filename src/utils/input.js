const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisified readline question
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Close readline interface
function close() {
    rl.close();
}

module.exports = {
    question,
    close
};
