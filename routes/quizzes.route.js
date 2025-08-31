const express = require("express");
const router = express.Router();
const controller = require("../controllers/quiz.controller.js");

// User ↔ Quiz Attempts junction
router.get("/quizAttempts/:quizId", controller.getQuizAttempts);
router.get("/quizAttempt/:quizId/:userId", controller.getQuizAttempt);

// Quiz ↔ Questions junction
router.post("/:quiz_id/questions/:question_id", controller.addQuestionToQuiz);
router.delete("/:quiz_id/questions/:question_id",controller.removeQuestionFromQuiz);
router.get("/:quiz_id/questions", controller.getQuizQuestions);

// Quizzes CRUD
router.get("/", controller.getAllQuizzes);
router.get("/:quiz_id", controller.getQuizById);
router.post("/", controller.createQuiz);
router.put("/:quiz_id", controller.updateQuiz);
router.delete("/:quiz_id", controller.deleteQuiz);

module.exports = router;
