const express = require("express");
const courses = require("../controllers/courses.controller")
const router = express.Router();

router.get("/", courses.getAllCourses);
router.get("/:course_id", courses.getCourse)
router.post("/addCourse", courses.addCourse);
router.delete("/deleteCourse/:course_id", courses.deleteCourse);
router.patch("/updateCourse/:course_id", courses.updateCourse);

module.exports = {router};