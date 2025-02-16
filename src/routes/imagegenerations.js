const ModelsUtil = require('../utils/models');
const { makeErrorJSON } = require('../utils/helper');
const logger = require('../utils/logger');
const { hasImageProfanity } = require('../utils/profanity');

module.exports = (app) => {
    app.post("/v1/chat/completions", async (req, res) => {
        const { model, prompt } = req.body;
        const allModels = await ModelsUtil.getAllModels(false);

        if (!allModels.includes(model)) {
            return res.status(400).json(makeErrorJSON("Invalid Model", 400));
        }

        if (hasImageProfanity(prompt)) {
            return res.status(400).json(makeErrorJSON("Image prompt violates content policy", 400));
        }

        let providers = await ModelsUtil.getProvidersForModel(model);

        let error;

        for (const provider of providers) {
            try {
                await provider.imageGeneration(req, res);
            } catch (err) {
                error = err;
                logger.error(`Error with provider ${provider.providerName}: ${err.message}`);
            }
        }

        return res.status(500).json(makeErrorJSON(`All providers failed (${error ? error.message : "Unknown error"})`, 500));
    });
};
