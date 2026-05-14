const express = require('express');
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} =require('../middlewares/authenticate')
const { getProduct, newProduct, getSingleProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview, getProductSuggestions, getCategories } = require('../controllers/productController');
//supplier
const {
  createSupplierProduct,
  getMyProducts,
  getAdminProducts,
  updateProductStatus,
  getPublicProducts,
} = require("../controllers/productController");
const upload = require("../middlewares/upload"); // ⬅️ ADD THIS LINE

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


// const upload = require("../middlewares/upload");
// const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Public: list products (customers see only accepted ones)
router.get("/products", getPublicProducts);

// Supplier: create product
router.post(
  "/product/new",
  isAuthenticatedUser,
  upload.array("images", 5),
  createSupplierProduct
);

// Supplier: get their own products
router.get("/myproducts", isAuthenticatedUser, getMyProducts);

// Admin: get all products
router.get(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminProducts
);

// Admin: update product status
router.put(
  "/admin/product/:id/status",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProductStatus
);


module.exports =router;