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

module.exports = {
  checkUser,
};
