const { makeErrorJSON } = require('../utils/helper');
const modelsUtil = require('../utils/models');

module.exports = (app) => {
    app.get('/v1/models', async (req, res) => {
        try {
            const models = await modelsUtil.getAllModels(true);
            res.json({ data: models });
        } catch (error) {
            console.error('Error fetching models:', error);
            res.status(500).json(makeErrorJSON("Internal Server Error", 500));
        }
    });    
};