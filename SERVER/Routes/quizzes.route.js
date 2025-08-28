const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getAllQuizes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quiz.controller.js");

const { checkUser } = require("../middleware/auth.middleware.js");
const { checkAdmin } = require("../middleware/admin.middleware.js");

// Public routes
router.get("/", getAllQuizes);
router.get("/:quiz_id", getQuizById);

// Protected (admin-only) routes
router.post("/", checkUser, checkAdmin, createQuiz);
router.put("/:quiz_id", checkUser, checkAdmin, updateQuiz);
router.delete("/:quiz_id", checkUser, checkAdmin, deleteQuiz);

module.exports = router;
