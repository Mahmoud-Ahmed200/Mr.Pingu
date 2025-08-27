const express = require("express");
const router = express.Router();
const controller = require("../controllers/question.controller");
router.post("/createQuestion", controller.addQuestion);
router.get("/fetchQuestions", controller.fetchQuestions);
router.get("/fetchQuestion/:id",controller.fetchQuestionByID)
router.delete("/deleteQuestion/:id",controller.deleteQuestion)
router.patch("/updateQuestion/:id",controller.updateQuestion)
module.exports = router;
