class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // 🔍 Search by Name or Brand (ONLY if it's NOT a category)
    async search() {
        if (this.queryStr.keyword) {
            // Check if the keyword matches an existing category
            const categoryExists = await this.query.model.findOne({ category: { $regex: this.queryStr.keyword, $options: 'i' } });

            if (categoryExists) {
                // If it's a category, filter by category instead
                this.query = this.query.find({ category: { $regex: this.queryStr.keyword, $options: 'i' } });
            } else {
                // Otherwise, treat it as a keyword search for name or brand
                this.query = this.query.find({
                    $or: [
                        { name: { $regex: this.queryStr.keyword, $options: 'i' } },
                        { brand: { $regex: this.queryStr.keyword, $options: 'i' } }
                    ]
                });
            }
        }
        return this;
    }

    // 🎯 Filter by Category and Other Fields
    filter() {
        const queryStrCopy = { ...this.queryStr };

        // Exclude fields not meant for filtering
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach((field) => delete queryStrCopy[field]);

        // Convert operators (gte, lte, etc.) to MongoDB format
        let queryStr = JSON.stringify(queryStrCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // 📌 Paginate the Results
    paginate(resultsPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultsPerPage * (currentPage - 1);

        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;
