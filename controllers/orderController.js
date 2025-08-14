const catchAsyncError = require("../middlewares/catchAsyncError");
const Order =require('../models/orderModel')
const Product=require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
//Create New Order - /api/v1/order/new



exports.newOrder =catchAsyncError(async(req,res,next)=>{
    const{
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    }=req.body;
    const order=await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt:Date.now(),
        user:req.user.id
    })
    res.status(200).json({
        success:true,
        order
    })
})

//Get Single Order -api/v1/order/:id

exports.getSingleOrder =catchAsyncError(async(req,res,next)=>
{
    const order=await Order.findById(req.params.id).populate('user','name email')
    if(!order)
        {
            return next(new ErrorHandler(`Order not found with id : ${req.params.id}`,404))


        }    
        res.status(200).json({
            success:true,
            order
        })
})

//Get loggedin User Orders - /api/v1/myorders
exports.myOrders =catchAsyncError(async(req,res,next)=>
    {
        const orders=await Order.find({user:req.user.id})
            res.status(200).json({
                success:true,
                orders
            })
    })
    
//Admin : Get All orders -api/v1/orders 
exports.orders = catchAsyncError(async(req,res,next)=>
{
    const orders = await Order.find();

    let totalAmount=0;
    orders.forEach(order =>{
        totalAmount+=order.totalPrice
    })
    res.status(200).json({
        success:true,
        totalAmount,orders
    })
})


//Admin:Update Order -api/v1/order/:id

exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with id: ${req.params.id}`, 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Order has already been delivered', 400));
    }

    //Updating product stock for each order item
    for (const orderItem of order.orderItems) {
        await updateStock(orderItem.product, orderItem.quantity);
    }

    order.orderStatus = req.body.orderStatus;
    if (req.body.orderStatus === 'Delivered') {
        order.deliveredAt = Date.now();
    }
    await order.save();

    res.status(200).json({
        success: true,
        order,
    });
});


async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return;
    }

    //console.log(`Before update: Stock = ${product.stock}`);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: true });
    //console.log(`After update: Stock = ${product.stock}`);
}


//Admin:Delete Order -api/v1/order/:id


exports.deleteOrder=catchAsyncError(async(req,res,next0)=>
{
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with id: ${req.params.id}`, 404));
    }
    await order.deleteOne();
    res.status(200).json({
        success:true
    })


})