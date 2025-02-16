const { model, Schema } = require("mongoose");

const modelSchema = new Schema({
    name: { type: String, required: true },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
});

const websiteSchema = new Schema({
    url: { type: String, required: true },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 }
});

const providerSchema = new Schema({
    name: { type: String, required: true },
    data: [websiteSchema],
});

const providerModel = model("Provider", providerSchema, "providers");

module.exports = { providerModel };
