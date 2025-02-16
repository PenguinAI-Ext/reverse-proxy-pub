const { providerModel } = require("../models/provider");

class ProviderManager {
    static async getProvider(provider) {
        try {
            return await providerModel.findOne({ name: provider });
        } catch (error) {
            console.error(error);
            return;
        }
    }

    static async updateProvider(provider, url, success) {
        try {
            const dataToUpdate = provider.data.find(obj => obj.url === url);

            if (dataToUpdate) {
                if (success) {
                    dataToUpdate.successCount += 1;
                } else {
                    dataToUpdate.failureCount += 1;
                }

                await providerModel.updateOne(
                    { name: provider.name },
                    { data: provider.data }
                );
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async initializeProvider(name, urls) {
        try {
            const existingProvider = await this.getProvider(name);
            if (!existingProvider) {
                const data = urls.map(url => ({
                    url,
                    successCount: 0,
                    failureCount: 0
                }));

                const newProvider = new providerModel({ name, data });
                await newProvider.save();
                console.log(`Provider ${name} initialized with URLs`);
            } else {
                console.log(`Provider ${name} already exists`);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = { ProviderManager };
