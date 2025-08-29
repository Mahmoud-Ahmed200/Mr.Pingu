const express = require("express");
const {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessons.controller.js");

const router = express.Router();

// Create a new lesson
router.post("/", createLesson);

// Get all lessons
router.get("/", getAllLessons);

// Get lesson by id
router.get("/:lesson_id", getLessonById);

// Update lesson by id (PATCH for partial update, you can use PUT if you prefer full update)
router.patch("/:lesson_id", updateLesson);

// Delete lesson by id
router.delete("/:lesson_id", deleteLesson);

module.exports = router;
