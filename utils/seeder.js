const products= require('../data/product.json');
const Product = require('../models/productModel');
const dotenv=require('dotenv');
const connectDb = require('../config/database');

dotenv.config({path:'backend/config/config.env'})
connectDb();


const seedProducts = async ()=>{
    try{

    
    await Product.deleteMany();
    console.log("Products are deleted")
    await Product.insertMany(products);
    console.log("All Products are added");
    }
    catch(error)
    {
        console.log(error.message);
    }
}
seedProducts();