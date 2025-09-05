const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET;
const checkUser = async (req, res, next) => {
  const token = req.cookies.JWT;
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Failed authentication",
    });
  }
  jwt.verify(token, jwtSecretKey, (error, decodedToken) => {
    if (error) {
      return res.status(401).json({
        success: false,
        error: "Failed authentication",
      });
    }
    req.user = decodedToken;
    next();
  });
};
const checkAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  checkUser,
  checkAdmin,
};
