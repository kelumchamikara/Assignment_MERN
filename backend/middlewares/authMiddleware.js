// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Check for token in various headers
  const token = 
    req.header("x-auth-token") || 
    (req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null);

  if (!token) {
    console.log("No authentication token found in request");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    console.log("Verifying token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user ID:", decoded.id);
    req.userId = decoded.id;  // Store the userId
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;