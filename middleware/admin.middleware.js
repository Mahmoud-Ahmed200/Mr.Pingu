const checkAdmin = (req, res, next) => {
  const user = req.user;
  if (user && user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Forbidden: Insufficient rights",
  });
};
module.exports = { checkAdmin };
