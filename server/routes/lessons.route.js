const express = require("express");
const router = express.Router();
const controller = require("../controllers/lessons.controller");

// Lessons CRUD
router.post("/", controller.createLesson);
router.get("/", controller.getAllLessons);
router.get("/:lesson_id", controller.getLessonById);
router.patch("/:lesson_id", controller.updateLesson);
router.delete("/:lesson_id", controller.deleteLesson);

module.exports = router;
