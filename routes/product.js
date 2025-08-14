const express = require('express');
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} =require('../middlewares/authenticate')
const { getProduct, newProduct, getSingleProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview, getProductSuggestions, getCategories } = require('../controllers/productController');



router.route('/products').get(getProduct);

router.route('/product/:id')
                            .get(getSingleProduct)
                            .put(updateProduct)
                            .delete(deleteProduct)
router.route('/review').put(isAuthenticatedUser,createReview)
                        .delete(deleteReview);
router.route('/reviews').get(getReviews);
router.get("/products/suggestions",getProductSuggestions);
router.get("/categories",getCategories)
//Admin routes
router.route('/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),newProduct);

module.exports =router;