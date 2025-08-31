const pool = require("../config/db.js");
const validator = require("validator");
// const { updateCourse } = require("./courses.controller");

const createLesson = async (req, res) => {
  try {
    const { title, content_documented, course_id, quiz_id, xp, content_video } =
      req.body;

    const newLesson = await pool.query(
      "INSERT INTO lessons (title,content_documented,course_id,quiz_id,xp,content_video) values($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, content_documented, course_id, quiz_id, xp, content_video]
    );

    return res.status(200).json({
      success: true,
      message: "lesson created successfully",
      lesson: newLesson.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllLessons = async (req, res) => {
  try {
    const lessons = await pool.query("SELECT * FROM lessons");
    if (lessons.rowCount == 0) {
      return res.status(404).json({
        success: false,
        message: "No lessons found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lessons fetched successfully",
      lessons: lessons.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getLessonById = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    if (!validator.isUUID(lesson_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }
    const lesson = await pool.query(
      "SELECT * FROM lessons WHERE lesson_id=$1",
      [lesson_id]
    );

    if (lesson.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: lesson.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const { title, content_documented, course_id, quiz_id, xp, content_video } =
      req.body;
    if (!validator.isUUID(lesson_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }

    const lesson = await pool.query(
      "UPDATE lessons SET title=$1, content_documented=$2, course_id=$3, quiz_id=$4, xp=$5, content_video=$6 WHERE lesson_id = $7 RETURNING *",
      [
        title,
        content_documented,
        course_id,
        quiz_id,
        xp,
        content_video,
        lesson_id,
      ]
    );

    if (lesson.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "lesson updated successfully",
      lesson: lesson.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    if (!validator.isUUID(lesson_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }
    const lesson = await pool.query(
      "DELETE FROM lessons WHERE lesson_id=$1 RETURNING *",
      [lesson_id]
    );
    if (lesson.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "lesson not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "lesson deleted successfully",
      lesson: lesson.rows[0],
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
  createLesson,
  deleteLesson,
  updateLesson,
  getAllLessons,
  getLessonById,
};
