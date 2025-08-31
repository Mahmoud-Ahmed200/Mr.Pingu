const express = require("express");
const router = express.Router();
const controller = require("../controllers/question.controller");

// Question Options (nested under a question)
router.post("/:id/options", controller.createQuestionOption);
router.get("/:id/options", controller.fetchQuestionOptions);
router.patch("/options/:optionId", controller.updateQuestionOption);
router.delete("/options/:optionId", controller.deleteQuestionOption);

// Questions
router.post("/", controller.addQuestion);
router.get("/", controller.fetchQuestions);
router.get("/:id", controller.fetchQuestionByID);
router.patch("/:id", controller.updateQuestion);
router.delete("/:id", controller.deleteQuestion);

module.exports = router;
