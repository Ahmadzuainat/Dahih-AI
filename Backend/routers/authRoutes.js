import express from "express";
import {body} from "express-validator";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from "../Controllers/authController.js";
import protect from "../middlewares/auth.js";

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



// THE ROUTES

// Public routes
router.post("/register", registerValidationRules, register);
router.post("/login", loginValidationRules, login);

// Protected routes
router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

export default router;