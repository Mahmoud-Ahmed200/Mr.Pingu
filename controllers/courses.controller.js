const pool = require("../config/db.js");
const validator = require("validator");

const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    return res.status(200).json({
      success: true,
      message: result.rows.length
        ? "Courses fetched successfully"
        : "No courses available yet",
      courses: result.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addCourse = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const newCourse = await pool.query(
      "INSERT INTO courses (title, category, description) values ($1, $2, $3) RETURNING *",
      [title, category, description]
    );

    return res.status(201).json({
      success: true,
      message: "Course added successfully",
      course: newCourse.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    if (!validator.isUUID(course_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }
    const course = await pool.query(
      "SELECT * FROM courses WHERE course_id = $1",
      [course_id]
    );
    if (course.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Course added successfully",
      course: course.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    if (!validator.isUUID(course_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }
    const deletedCourse = await pool.query(
      "DELETE FROM courses WHERE course_id = $1 RETURNING *",
      [course_id]
    );

    if (deletedCourse.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "course not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      course: deletedCourse.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { title, category, description } = req.body;
    if (!validator.isUUID(course_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }
    const course = await pool.query(
      `UPDATE courses 
       SET title = $1, category = $2, description = $3 
       WHERE course_id = $4 
       RETURNING *`,
      [title, category, description, course_id]
    );
    if (course.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: course.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getCourseUsers = async (req, res) => {
  try {
    const { course_id } = req.params;
    if (!validator.isUUID(course_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }
    const users = await pool.query(
      `SELECT c.user_id,u.email,u.username,u.fullname,u.xp,u.personal_photo,u.rank,u.strike
       FROM coursesperuser c
       JOIN users u ON c.user_id=u.user_id
       WHERE c.course_id=$1`,
      [course_id]
    );
    res.status(200).json({
      success: true,
      message: users.rows.length
        ? "Enrolled users fetched successfully"
        : "No users enrolled to this course yet",
      count: users.rowCount,
      users: users.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  deleteCourse,
  updateCourse,
  getCourseUsers,
};
