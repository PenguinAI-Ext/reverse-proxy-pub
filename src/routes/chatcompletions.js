const ModelsUtil = require('../utils/models');
const { makeErrorJSON } = require('../utils/helper');
const logger = require('../utils/logger');
const { hasProfanity } = require('../utils/profanity');
const redis = require('../config/redis');
const { hash } = require('../utils/hash');

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

/**
 * Creates a cache key from request parameters
 * @param {Object} body - Request body
 * @returns {string} - Cache key
 */
function createCacheKey(body) {
    const { model, messages } = body;
    const stringToHash = `${model}-${JSON.stringify(messages)}`;
    return `chat:${hash(stringToHash)}`;
}

module.exports = (app) => {
    app.post("/v1/chat/completions", async (req, res) => {
        const { model, stream, messages } = req.body;
        
        // Don't cache streaming responses
        if (stream) {
            const allModels = await ModelsUtil.getAllModels(false);

            if (!allModels.includes(model)) {
                return res.status(400).json(makeErrorJSON("Invalid Model", 400));
            }

            if (await hasProfanity(messages)) {
                return res.status(400).json(makeErrorJSON("Content violates content policy", 400));
            }

            let providers = await ModelsUtil.getProvidersForModel(model);

            let error;

            for (const provider of providers) {
                try {
                    await provider.chatCompletion(req, res);
                } catch (err) {
                    error = err;
                    logger.error(`Error with provider ${provider.providerName}: ${err.message}`);
                }
            }

            return res.status(500).json(makeErrorJSON(`All providers failed (${error ? error.message : "Unknown error"})`, 500));
        }

        const cacheKey = createCacheKey(req.body);
        
        try {
            // Check cache first
            const cachedResponse = await redis.get(cacheKey);
            if (cachedResponse) {
                logger.info(`Cache hit for ${cacheKey}`);
                return res.json(JSON.parse(cachedResponse));
            }

            const allModels = await ModelsUtil.getAllModels(false);

            if (!allModels.includes(model)) {
                return res.status(400).json(makeErrorJSON("Invalid Model", 400));
            }

            if (await hasProfanity(messages)) {
                return res.status(400).json(makeErrorJSON("Content violates content policy", 400));
            }

            let providers = await ModelsUtil.getProvidersForModel(model);
            let error;

            for (const provider of providers) {
                try {
                    // Capture the response
                    const response = await provider.chatCompletion(req);
                    
                    // Cache successful response
                    await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(response));
                    
                    return res.json(response);
                } catch (err) {
                    error = err;
                    logger.error(`Error with provider ${provider.providerName}: ${err.message}`);
                }
            }

            return res.status(500).json(makeErrorJSON(`All providers failed (${error ? error.message : "Unknown error"})`, 500));
        } catch (err) {
            logger.error(`Cache error: ${err.message}`);
            // Continue without cache
            const allModels = await ModelsUtil.getAllModels(false);

            if (!allModels.includes(model)) {
                return res.status(400).json(makeErrorJSON("Invalid Model", 400));
            }

            if (await hasProfanity(messages)) {
                return res.status(400).json(makeErrorJSON("Content violates content policy", 400));
            }

            let providers = await ModelsUtil.getProvidersForModel(model);

            let error;

            for (const provider of providers) {
                try {
                    await provider.chatCompletion(req, res);
                } catch (err) {
                    error = err;
                    logger.error(`Error with provider ${provider.providerName}: ${err.message}`);
                }
            }

            return res.status(500).json(makeErrorJSON(`All providers failed (${error ? error.message : "Unknown error"})`, 500));
        }
    });
};
