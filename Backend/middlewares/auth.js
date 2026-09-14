import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const protect = async (req, res, next) => {

  // 1. Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    try {

      // 2. Get token from header
      const token = req.headers.authorization.split(" ")[1];

      // 3. Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // 4. Get user from database
      req.user = await User.findById(decoded.id).select("-password");

      // 5. Check if user exists
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
          statusCode: 401
        });
      }

      // 6. Continue to controller
      next();

    } catch (error) {

      console.error(
        "Auth middleware error:",
        error.message
      );

      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        statusCode: 401
      });
    }

  } else {

    // No token
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
      statusCode: 401
    });
  }
};

export default protect;