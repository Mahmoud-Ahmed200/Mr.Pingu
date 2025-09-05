const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const { checkAdmin } = require("../middleware/auth.middleware");

// User ↔ Skills junction
router.get("/skills", controller.fetchUserSkills);
router.post("/skills/:skillId", controller.addUserSkill);
router.delete("/skills/:skillId", controller.deleteUserSkill);

// User ↔ Quiz Attempts junction
router.post("/quizAttempts/:quizId", controller.createQuizAttempt);
router.get("/quizAttempts", controller.getUserAttempts);

// User ↔ Course junction
router.post("/courses/:course_id", controller.enrollUser);
router.get("/courses", controller.getUserCourses);

// User ↔ Lesson junction
router.post("/lessons/:lesson_id", controller.createLessonProgress);
router.patch("/lessons/:lesson_id", controller.updateLessonProgress);
router.get("/lessons", controller.getLessonsProgress);
router.get("/lessons/:lesson_id", controller.getLessonProgress);

// User CRUD
router.get("/", checkAdmin, controller.fetchUsers);
router.get("/:id", checkAdmin, controller.fetchUserById);
router.post("/", checkAdmin, controller.createUser);
router.delete("/:id", checkAdmin, controller.deleteUser);
router.patch("/:id", checkAdmin, controller.updateUser);

module.exports = router;
