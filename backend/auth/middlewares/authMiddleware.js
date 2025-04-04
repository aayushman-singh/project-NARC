import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  const JWT_SECRET = "1234"; // Hardcoded secret

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log(`${JWT_SECRET}`)
      token = req.headers.authorization.split(" ")[1];
     

      const decoded = jwt.verify(token, JWT_SECRET); // Verify token with hardcoded secret
     

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        console.error("No user found in database for given ID");
        res.status(400);
        throw new Error("User not found");
      }

    
      next();
    } catch (error) {
      console.error(`Token validation error: ${error.message}`);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.error("No token provided in request headers");
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});
