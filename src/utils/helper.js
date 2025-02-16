/**
 * Makes a JSON that shows the error message in a better way to look
 * @param {string} errormsg - The error message.
 * @param {number} code - The error code.
 * @returns {Object} - Object 
 */
function makeErrorJSON(errormsg, code) {
    return {"error":{"message":errormsg,"code":code}};
}

module.exports = { 
    makeErrorJSON
};