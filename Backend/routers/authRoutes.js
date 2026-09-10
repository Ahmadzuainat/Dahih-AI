import express from "express";
import {body} from "express-validator";
import {registerUser, loginUser, getProfile,updateprofile,changepassword} from "../controllers/authController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();
// validation rules for registration
const registerValidationRules = [
    body("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters"),
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
// validation rules for login
const loginValidationRules = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];
// Public routes
router.post("/register",registerValidationRules,registerUser);
router.post("/login",loginValidationRules,loginUser);

// Protected routes
router.get("/profile",protect,getProfile);
router.put("/updateprofile",protect,updateprofile);
router.put("/changepassword",protect,changepassword);

export default router;