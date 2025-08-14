const mongoose = require("mongoose");
const Product= require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError=require('../middlewares/catchAsyncError');
const APIFeatures = require("../utils/apiFeautures");
const ProductSuggestion = require("../models/productSuggestions");
exports.getProduct = async (req, res, next) => {
    try {
        const resPerPage = Math.max(Number(req.query.limit) || 9, 1); 
        const page = Math.max(Number(req.query.page) || 1, 1); 
        let keyword = req.query.keyword ? decodeURIComponent(req.query.keyword) : ""; 
        let categories = req.query.category;

        let filter = {}; 

        // ✅ Handle multiple categories
        if (categories) {
            categories = categories.split(",").map(c => c.trim());
            filter.category = { $in: categories };
        }

        // ✅ Keyword filtering (applies to name OR category)
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword.replace(/\s+/g, ".*"), $options: "i" } },
                { category: { $regex: keyword.replace(/\s+/g, ".*"), $options: "i" } }
            ];
        }
        if (req.query.price) {
            const minPrice = Number(req.query.price.gte) || 1;
            const maxPrice = Number(req.query.price.lte) || 100000;
            filter.price = { $gte: minPrice, $lte: maxPrice };
        }
        
        

        // ✅ Rating Filtering
        if (req.query.rating) {
            const rating = Number(req.query.rating);
            filter.ratings =rating ;
        }

        // ✅ Get total count before applying pagination
        const totalProductsCount = await Product.countDocuments(filter);

        // ✅ Apply pagination
        const products = await Product.find(filter)
            .skip((page - 1) * resPerPage)
            .limit(resPerPage);

        // console.log("🔹 Received Query:", req.query);
        // console.log("🔹 Total Products Found:", totalProductsCount);
        // console.log("🔹 Products Sent to Frontend:", products.length, "Page:", page);

        res.status(200).json({
            success: true,
            count: totalProductsCount,
            resPerPage,
            products,
            totalPages: Math.max(Math.ceil(totalProductsCount / resPerPage), 1),
        });

    } catch (error) {
        console.error("❌ Error in getProduct:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// //Create Product - api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next)=>{
    let images = []
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    if(req.files.length > 0) {
        req.files.forEach( file => {
            let url = `${BASE_URL}/uploads/product/${file.originalname}`;
            images.push({ image: url })
        })
    }

    req.body.images = images;

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
});


//get a Single Product - {{base_url}}/api/v1/product/:id
exports.getSingleProduct =async(req,res,next)=>{
    const product = await Product.findById(req.params.id).populate('reviews.user','name isEmail');
    const totalProductsCount =await Product.countDocuments({});
    
    if(!product){
      
        return next(new ErrorHandler("Product Not FOund",400));
    }
    res.status(201).json({
        success:true,
        product
    })
}

//Update Product - {{base_url}}/api/v1/product/:id
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    //uploading images
    let images = []

    //if images not cleared we keep existing images
    if(req.body.imagesCleared === 'false' ) {
        images = product.images;
    }
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    if(req.files.length > 0) {
        req.files.forEach( file => {
            let url = `${BASE_URL}/uploads/product/${file.originalname}`;
            images.push({ image: url })
        })
    }


    req.body.images = images;
    
    if(!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })

})


//delete a Product -{{base_url}}/api/v1/product/:id
exports.deleteProduct = async(req,res,next) =>{
    let product=await Product.findById(req.params.id)
    if(!product){
        return res.status(404).json({
            success:false,
            message:"Product not found"
        })
    }
    await product.deleteOne();
    res.status(200).json({
        success:true,
        message:"Product Deleted "
    })

}



exports.createReview = catchAsyncError(async (req, res, next) => {
    console.log("Request Body:", req.body); // Debugging: Check request data

    const { productId, rating, comment } = req.body;

    // Check if all required fields are provided
    if (!productId || !rating || !comment) {
        return next(new ErrorHandler("Please provide product ID, rating, and comment", 400));
    }

    const product = await Product.findById(productId);
    
    // Check if the product exists
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const review = {
        user: req.user.id,
        rating: Number(rating),
        comment,
    };

    // Check if user has already reviewed the product
    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user.id.toString());

    if (isReviewed) {
        // Update existing review
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user.id.toString()) {
                rev.rating = Number(rating);
                rev.comment = comment;
            }
        });
    } else {
        // Add new review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // Calculate the average rating
    let totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.ratings = totalRating / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Review submitted successfully",
    });
});
















//Get Reviews - api/v1/reviews?id={productId}

exports.getReviews = catchAsyncError(async (req,res,next)=>{
    const product = await Product.findById(req.query.id)
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})
//Delete Review -api/v1/review

exports.deleteReview =catchAsyncError(async (req,res,next)=>{
    const product =await Product.findById(req.query.productId)
    const reviews=product.reviews.filter(review=>{
        return review._id.toString()!== req.query.id.toString()
    })
    const numOfReviews =reviews.length;
    let ratings=reviews.reduce((acc, review)=>{
        return review.rating+acc;
    },0)/reviews.length;
    ratings=isNaN(ratings)?0:ratings;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        numOfReviews,
        ratings
    })
    res.status(200).json({
        success:true
    })

})
exports.getProductSuggestions = async (req, res, next) => {
    try {
        const keyword = req.query.query?.trim();
        if (!keyword) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        // 🔹 Find matching product names, brands, and categories
        const matchingProducts = await Product.find({ 
            name: new RegExp(`^${keyword}`, "i") 
        }).select("name").lean();

        const matchingBrands = await Product.find({ 
            brand: new RegExp(`^${keyword}`, "i") 
        }).select("brand").lean();

        const matchingCategories = await Product.find({ 
            category: new RegExp(`^${keyword}`, "i") 
        }).select("category").lean();

        // 🔹 Extract unique values
        const productNames = [...new Set(matchingProducts.map((p) => p.name))];
        const brandNames = [...new Set(matchingBrands.map((p) => p.brand))];
        const categoryNames = [...new Set(matchingCategories.map((p) => p.category))];

        // 🔹 Prioritize: Products → Brands → Categories (All included)
        let suggestions = [...productNames, ...brandNames, ...categoryNames];

        return res.status(200).json({
            success: true,
            suggestions: suggestions.slice(0, 5) // Limit results to top 5
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1); // Ensure valid page
        const limit = Math.max(Number(req.query.limit) || 5, 1); // Ensure valid limit
        const skip = (page - 1) * limit;

        // ✅ MongoDB handles pagination efficiently
        const categories = await Product.aggregate([
            { $group: { _id: "$category" } }, // ✅ Get distinct categories
            { $sort: { _id: 1 } }, // ✅ Sort alphabetically (optional)
            { $skip: skip }, // ✅ Apply pagination
            { $limit: limit }, // ✅ Limit results
            { $project: { _id: 0, category: "$_id" } } // ✅ Format output
        ]);

        // ✅ Get total number of distinct categories (only one DB call)
        const totalCategories = await Product.distinct("category").then((res) => res.length);

        res.status(200).json({
            success: true,
            categories: categories.map(c => c.category), // Extract category names
            totalCategories, // ✅ Send total count for pagination
        });
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};
