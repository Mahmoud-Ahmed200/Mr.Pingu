const pool = require("../config/db.js");

const enrollUser = async (req, res) => {
  try {
    const { user_id, course_id } = req.params;
    if (!user_id || !course_id) {
      return res.status(401).json("Invalid course or user");
    }
    const enroll = await pool.query(
      "INSERT INTO coursesperuser (course_id, user_id), VALUES ($1, $2) RETURNING *",
      [course_id, user_id]
    );

    if (enroll.rows.length == 0) {
      return res.status(400).json("Incorrect enrollment");
    }

    res.status(200).json(enroll.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
};

const getUserCourse = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (user_id = null) {
      return res.status(401).json("Invalid user");
    }

    const course = await pool.query(
      "SELECT course_id FROM coursesperuser WHERE user_id=$1",
      [user_id]
    );

    if (course.rows.length == 0) {
      return res.status(404).json("No courses found");
    }

    res.status(200).json(course.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const getCourseUsers = async (req, res) => {
  try {
    const { course_id } = req.params;
    if ((course_id = null)) {
      return res.status(401).json("Invalid course");
    }
    const users = await pool.query(
      "SELECT user_id FROM coursesperuser WHERE course_id=$1",
      [course_id]
    );

    if (users.rows.length == 0) {
        return res.status(400).json("no users found");
    }

    req.status(200).json(users.rows)
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};


module.exports = { enrollUser, getUserCourse, getCourseUsers };
