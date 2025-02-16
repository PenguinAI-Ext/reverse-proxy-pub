require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { makeErrorJSON } = require('./utils/helper');
const cors = require("cors");
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 7153;

app.use(cors());
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.set("json spaces", 2);

const loadRoutes = (app) => {
    return new Promise((resolve, reject) => {
        const routesPath = path.join(__dirname, 'routes');
        
        fs.readdir(routesPath, (err, files) => {
            if (err) {
                logger.error(`Error reading routes directory: ${err}`);
                reject(err);
                return;
            }

            files.forEach(file => {
                if (file.endsWith('.js')) {
                    const route = require(path.join(routesPath, file));
                    route(app);
                    logger.info(`Loaded route: ${file}`);
                }
            });
            
            // Add 404 handler after all routes are loaded
            app.use('*', (req, res) => {
                res.status(404).json(makeErrorJSON('Route not found', 404));
            });
            
            resolve();
        });
    });
};

const loadMiddlewares = (app) => {
    return new Promise((resolve, reject) => {
        const middlewaresPath = path.join(__dirname, 'middlewares');
        
        fs.readdir(middlewaresPath, (err, files) => {
            if (err) {
                logger.error(`Error reading middlewares directory: ${err}`);
                reject(err);
                return;
            }

            files.forEach(file => {
                if (file.endsWith('.js') && file !== 'ratelimit.js') {
                    const middleware = require(path.join(middlewaresPath, file));
                    app.use(middleware);
                    logger.info(`Loaded middleware: ${file}`);
                }
            });
            
            resolve();
        });
    });
};

const startServer = async () => {
    await connectDB();
    await loadMiddlewares(app);
    
    const rateLimit = require('./middlewares/ratelimit');
    app.use(rateLimit({ 
        points: 100, 
        duration: 60,
        exclude: [
            '/',
            '/v1',
            '/v1/models'
        ]
    }));
    
    await loadRoutes(app);
    
    app.listen(PORT, () => {
        logger.success(`Server is running on http://localhost:${PORT}`);
    });
};

startServer().catch(err => {
    logger.error(`Failed to start server: ${err}`);
    process.exit(1);
});
