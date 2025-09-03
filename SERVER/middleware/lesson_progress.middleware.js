const checkLessonAccess = async (req, res, next) => {
  try {
    const { user_id } = req.user; // assume JWT middleware sets req.user
    const { lesson_id } = req.params;

    // Get lesson and its prerequisite
    const lesson = await pool.query(
      "SELECT prerequisite_lesson_id FROM lessons WHERE lesson_id=$1",
      [lesson_id]
    );

    if (lesson.rows.length === 0) {
      return res.status(404).json("Lesson not found");
    }

    const prerequisite = lesson.rows[0].prerequisite_lesson_id;

    if (!prerequisite) {
      return next(); // no prerequisite → allow access
    }

    // Check if user completed prerequisite
    const completed = await pool.query(
      "SELECT * FROM user_lessons WHERE user_id=$1 AND lesson_id=$2 AND completed=true",
      [user_id, prerequisite]
    );

    if (completed.rows.length === 0) {
      return res
        .status(403)
        .json("You must complete the prerequisite lesson first");
    }

    next(); // prerequisite met → allow access
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};
