const fs = require("fs").promises;
const path = require("path");

const getAllModels = async (formatted) => {
    const files = await fs.readdir(path.join(__dirname, "..", "providers"));
    const modelsMap = new Map();

    for (const file of files) {
        if (file.endsWith(".js")) {
            try {
                const ModuleClass = require(path.join(__dirname, "..", "providers", file));
                
                const moduleInstance = new ModuleClass();

                if (formatted) {
                    const type = moduleInstance.chatCompletion ? "chat.completions" : "images.generations";
                    moduleInstance.models.forEach((model) => {
                        const modelObj = {
                            id: model,
                            object: "model",
                            owned_by: moduleInstance.providerName,
                            created_at: 0,
                            type
                        };

                        modelsMap.set(model, modelObj);
                    });
                } else {
                    moduleInstance.models.forEach((model) => modelsMap.set(model, model));
                }
            } catch (error) {
                console.error(`Error loading module ${file}:`, error);
            }
        }
    }

    const models = formatted ?
        Array.from(modelsMap.values()) :
        Array.from(modelsMap.keys());

    return models;
};

const getProvidersForModel = async (model) => {
    const files = await fs.readdir(path.join(__dirname, "..", "providers"));
    const providers = [];
  
    for (const file of files) {
      if (file.endsWith(".js")) {
        const ModuleClass = require(`../providers/${file}`);

        const moduleInstance = new ModuleClass();
        
        if (moduleInstance && moduleInstance.models.includes(model)) {
          providers.push(moduleInstance);
        }
      }
    }
  
    return providers;
};

module.exports = { getAllModels, getProvidersForModel };