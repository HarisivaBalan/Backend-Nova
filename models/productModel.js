const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    count:{
        type:Number ,
    },
    name:{
        type:String,
        required :[true,"Please Enter Product Name"],
        trim : true,
        maxlength:[100,"Product name cannot exceed 100 characters"]
    },
    brand: {
        type: String,
        required: [true, "Please Enter Product Brand"],
    },
    price:{
        type:Number ,
        requiured : true,
        default:0.0 
    },
    originalPrice: {
        type: Number,
        required: [true, "Please Enter the Original Price"],
      },
      discount: {
        type: Number,
        default: function () {
          // Automatically calculate the discount based on price and originalPrice
          return this.originalPrice
            ? Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
            : 0;
        },
      },
    
    description: {
        type: String,
        required:[true,"Please ENter product description"]
    },
    ratings :{
        type : String,
        default:0
    },
    images :[
        {
            url:{
                type :String,
                required:[true,"Path `url` is required"]
            }
        }

    ],
    category:{
        type:String,
        required:[true,"PLease enter product category"],
        enum:{
            values : [
                "Laptops",
                "Accessories",
                "Food",
                "Snacks",
                "Mobile Phones",
                "Books",
                "Clothes",
                "Shoes",
                "Beauty/Health",
                "Sports",
                "Outdoor",
                "Home",
                "Headphones",
                "Bags"

            ],
            message:"Please Select correct category"
                
            }
        },
        seller:{
            type: String,
            required:[true, "Please Enter Product Seller"]
        },
        stock:{
            type:Number,
            required:[true,"Please enter product stock"],
            maxLength:[20,"Product Stock cannot exceed "]
        },
        numOfReviews:{
            type:Number,
            defult:0
        },
        reviews:[
            {
                user: {
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'User'
                },
                rating:{
                    type:String,
                    required:true
                },
                comment:{
                    type:String,
                    required:true
                }
            }
        ],
        user:{
            type : mongoose.Schema.Types.ObjectId
        },
        createdAt:{
            type:Date,
            default:Date.now()
        }
        
    
    
})
let schema=mongoose.model('Product',productSchema)

module.exports = schema