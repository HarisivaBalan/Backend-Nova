const express = require('express');
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserProfile, changePassword, updateProfile, getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/authController');
const router = express.Router();
const{  isAuthenticatedUser, authorizeRoles}=require('../middlewares/authenticate')
const multer=require('multer');
const path=require('path');
const upload=multer({storage:multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,path.join(__dirname,'..','uploads/users'))
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})})

router.route('/register').post(upload.single('avatar'),registerUser);
router.route('/login').post(loginUser)
router.route('/logout').post(logoutUser)
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
//router.route('/myprofile').get(isAuthenthicatedUser,getUserProfile);
router.route('/myprofile').get(isAuthenticatedUser,getUserProfile)
router.route('/password/change').put(isAuthenticatedUser,changePassword);
router.route('/update').put(isAuthenticatedUser,upload.single('avatar'),updateProfile)
router.route("/me").get(isAuthenticatedUser, getUserProfile);

//Adminroutes
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'),getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin'),getUser)
.put(isAuthenticatedUser,authorizeRoles('admin'),updateUser)
.delete(isAuthenticatedUser,authorizeRoles('admin'),deleteUser);




module.exports =router;