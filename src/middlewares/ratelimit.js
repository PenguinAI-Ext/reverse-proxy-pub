const redis = require('../config/redis');
const { makeErrorJSON } = require('../utils/helper');
const { hash } = require('../utils/hash');

const getRealIP = (req) => {
    return req.headers['cf-connecting-ip'] || req.ip;
};

const rateLimit = ({ points = 10, duration = 60, blockDuration = 3600, exclude = [] } = {}) => {
    const excludedPaths = new Set(exclude);

    return async (req, res, next) => {
        if (excludedPaths.has(req.path)) {
            return next();
        }

        const ip = getRealIP(req);
        const hashedIP = hash(ip);
        const key = `ratelimit:${hashedIP}`;
        
        try {
            const [current] = await redis.pipeline()
                .incr(key)
                .expire(key, duration)
                .exec();

            const attempts = current[1];

            res.setHeader('X-RateLimit-Limit', points);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, points - attempts));

            if (attempts > points) {
                return res.status(429).json(
                    makeErrorJSON('Too many requests', 429)
                );
            }

            next();
        } catch (err) {
            console.error('Rate limiting error:', err);
            next();
        }
    };
};

module.exports = rateLimit;
