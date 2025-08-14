const catchAsyncError = require('../middlewares/catchAsyncError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.processPayment = catchAsyncError(async (req, res, next) => {
    const { amount, shipping } = req.body; // Destructure amount and shipping from the request body
    console.log("Amount received:", amount);
    console.log("Shipping received:", shipping);
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount:  amount , // Pass the amount in paise (e.g., ₹100 -> 10000)
            currency: 'inr', // Specify Indian Rupees
            description: 'Payment for Order', // Update the description as needed
            metadata: { integration_check: 'accept_payment' }, // Optional metadata
            shipping: shipping || {}, // Ensure shipping details are optional and structured correctly
        });

        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret, // Return the client secret for the frontend
        });
    } catch (error) {
        console.error("Error creating payment intent:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong while processing the payment.",
        });
    }
});

// Send Stripe API Key to Frontend
exports.sendStripeApi = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY, // Return the Stripe API Key
    });
});
