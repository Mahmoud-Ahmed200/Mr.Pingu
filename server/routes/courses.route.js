const express = require("express");
const router = express.Router();
const { checkAdmin } = require("../middleware/auth.middleware");
const controller = require("../controllers/courses.controller");

// Courses ↔ Users junction
router.get("/:course_id/users", controller.getCourseUsers);

// Courses CRUD
router.get("/", controller.getAllCourses);
router.get("/:course_id", controller.getCourse);
router.post("/", checkAdmin, controller.addCourse);
router.patch("/:course_id", checkAdmin, controller.updateCourse);
router.delete("/:course_id", checkAdmin, controller.deleteCourse);

module.exports = router;
