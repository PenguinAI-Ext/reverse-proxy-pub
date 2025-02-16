class LoadBalancer {
    static getAvailabilityForWebsite(website) {
        const totalRequests = website.successCount + website.failureCount;
        return totalRequests > 0 ? (website.successCount / totalRequests) * 100 : 100;
    }

    static async getBestProvider(provider) {
        if (!provider?.data?.length) {
            return null;
        }

        try {
            const providerMetrics = provider.data
                .map(website => ({
                    url: website.url,
                    availability: this.getAvailabilityForWebsite(website),
                    totalRequests: website.successCount + website.failureCount,
                }))
                .sort((a, b) => 
                    b.availability - a.availability || a.totalRequests - b.totalRequests
                );

            return providerMetrics[0]?.url || null;
        } catch (error) {
            console.error("Failed to get the best provider:", error);
            return null;
        }
    }
}

module.exports = { LoadBalancer };
