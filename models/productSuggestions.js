const mongoose = require("mongoose");

const productSuggestionSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        unique: true // Ensures no duplicate keywords
    },
    relatedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product" // Links to Product schema
        }
    ],
    popularity: {
        type: Number,
        default: 0 // Tracks how often a keyword is searched
    }
});

module.exports = mongoose.model("ProductSuggestion", productSuggestionSchema);
