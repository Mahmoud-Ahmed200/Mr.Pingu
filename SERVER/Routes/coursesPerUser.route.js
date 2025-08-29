const express = require("express");
const router = express.Router();
const {
  enrollUser,
  getUserCourse,
  getCourseUsers,
} = require("../controllers/coursesPerUser.controller.js");

router.post("/enroll/:user_id/:course_id", enrollUser);
router.get("/user/:user_id/courses", getUserCourse);
router.get("/course/:course_id/users", getCourseUsers);

module.exports = router;
