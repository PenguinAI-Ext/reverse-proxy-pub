const colors = require('colors');

const logger = {
    info: (message) => console.log(`[?] ${message}`.blue),
    success: (message) => console.log(`[.] ${message}`.green),
    error: (message) => console.log(`[!] ${message}`.red),
    warn: (message) => console.log(`[!] ${message}`.yellow),
    debug: (message) => console.log(`[?] ${message}`.gray)
};

module.exports = logger;
