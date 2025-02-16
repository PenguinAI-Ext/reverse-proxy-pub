const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
});

redis.on('error', (err) => logger.error(`Redis Client Error: ${err}`));
redis.on('connect', () => logger.success('Connected to Redis'));

module.exports = redis;
