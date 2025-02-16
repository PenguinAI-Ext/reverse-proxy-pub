const crypto = require('crypto');

const hash = (v) => {
    const salt = process.env.HASH_SALT || 'default-salt';
    return crypto
        .createHash('md5')
        .update(v + salt)
        .digest('hex');
};

module.exports = { hash };
