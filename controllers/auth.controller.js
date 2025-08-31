const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwtSecretKey = process.env.JWT_SECRET;
const maxAge = 60 * 60 * 24 * 3;
const createJWT = (user) => {
  const payload = {
    id: user.user_id,
    username: user.username,
    email: user.email,
    rank: user.rank,
    xp: user.xp,
    strike: user.strike,
    role: user.role,
  };
  const token = jwt.sign(payload, jwtSecretKey, {
    expiresIn: maxAge,
  });
  return token;
};
const validateSignUp = ({ email, username, password, fullname }) => {
  if (!email || !username || !password || !fullname)
    return "Missing required fields";
  if (!validator.isEmail(email)) return "Invalid email format";
  if (!validator.isLength(username, { min: 3, max: 20 }))
    return "Username must be 3-20 characters";
  if (!validator.isStrongPassword(password))
    return "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol";
  if (!validator.isLength(fullname, { min: 3, max: 50 }))
    return "Fullname must be 3 characters at minimum";
  return null;
};
const validateSignIn = ({ email, password }) => {
  if (!email || !password) return "Missing required fields";
  if (!validator.isEmail(email)) return "Invalid email format";
  return null;
};
const signUp = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const username = req.body.username?.trim();
    const fullname = req.body.fullname?.trim();
    const password = req.body.password;
    const error = validateSignUp({
      email,
      username,
      password,
      fullname,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }
    const insert_query = `
        INSERT INTO users (email,username,hashed_pass,fullname)
        VALUES ($1,$2,$3,$4)
        RETURNING *
          `;

    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    const result = await pool.query(insert_query, [
      email,
      username,
      hashedPass,
      fullname,
    ]);
    const user = result.rows[0];
    delete user.hashed_pass;
    const token = createJWT(user);
    res.cookie("JWT", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
      if (error.detail.includes("username")) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }
    }
    console.error("Error signing up:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const signIn = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const error = validateSignIn({ email, password });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }
    const checkQuery = `SELECT * FROM users WHERE email=$1`;
    const result = await pool.query(checkQuery, [email]);
    const user = result.rows[0];
    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    const checkPassword = await bcrypt.compare(password, user.hashed_pass);
    delete user.hashed_pass;
    if (checkPassword) {
      const token = createJWT(user);
      res.cookie("JWT", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });
      return res.status(200).json({
        success: true,
        message: "User signed in successfully",
        user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
  } catch (error) {
    console.error("Error signing in:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const signOut = (req, res) => {
  try {
    const token = req.cookies.JWT;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No user logged in",
      });
    }
    res.clearCookie("JWT", { httpOnly: true });
    return res.status(200).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    console.error("Error signing out:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  signUp,
  signIn,
  signOut,
};
