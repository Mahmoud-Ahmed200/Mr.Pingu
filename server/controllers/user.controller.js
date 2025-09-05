const pool = require("../config/db");
const bcrypt = require("bcrypt");
const validator = require("validator");
const validateCreateUser = ({ email, username, password, fullname, role }) => {
  if (!email || !username || !password || !fullname || !role)
    return "Missing required fields";
  if (!validator.isEmail(email)) return "Invalid email format";
  if (!validator.isLength(username, { min: 3, max: 20 }))
    return "Username must be 3-20 characters";
  if (!validator.isStrongPassword(password))
    return "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol";
  if (!validator.isLength(fullname, { min: 3, max: 50 }))
    return "Fullname must be 3 characters at minimum";
  if (!validator.isIn(role, ["admin", "user"]))
    return "Role must be either user or admin";
  return null;
};

// User CRUD
const createUser = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const username = req.body.username?.trim();
    const fullname = req.body.fullname?.trim();
    const password = req.body.password;
    const role = req.body.role?.trim();
    const error = validateCreateUser({
      email,
      username,
      password,
      fullname,
      role,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }
    const insert_query = `
       INSERT INTO users (username,email,hashed_pass,fullname,role)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING user_id,email,username,fullname,xp,personal_photo,rank,strike,role,created_at
        `;
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    const result = await pool.query(insert_query, [
      username,
      email,
      hashedPass,
      fullname,
      role,
    ]);
    const user = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "User inserted successfully",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
      if (error.detail.includes("username")) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }
    }
    console.error("Error signing up:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchUsers = async (req, res) => {
  try {
    const fetchQuery = `SELECT user_id,email,username,fullname,xp,personal_photo,rank,strike,role,created_at FROM users`;
    const result = await pool.query(fetchQuery);
    const users = result.rows;
    return res.status(200).json({
      success: true,
      message: users.length
        ? "Users fetched successfully"
        : "No users available yet",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const fetchQuery = `
    SELECT user_id,email,username,fullname,xp,personal_photo,rank,strike,role,created_at
    FROM users
    WHERE user_id=$1
     `;
    const result = await pool.query(fetchQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    const user = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.body.username?.trim();
    const fullname = req.body.fullname?.trim();
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const fields = [];
    const values = [id];
    let counter = 2;
    if (username !== undefined) {
      fields.push(`username=$${counter++}`);
      values.push(username);
    }
    if (fullname !== undefined) {
      fields.push(`fullname=$${counter++}`);
      values.push(fullname);
    }
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }
    const update_query = `
    UPDATE users
    SET ${fields.join(" , ")}
    WHERE user_id=$1
    RETURNING user_id,email,username,fullname,xp,personal_photo,rank,strike,role,created_at`;
    const result = await pool.query(update_query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const updatedUser = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "User data updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const deleteQuery = `
    DELETE FROM users 
    WHERE user_id=$1 
    RETURNING user_id,email,username,fullname,xp,personal_photo,rank,strike,role,created_at
    `;
    const result = await pool.query(deleteQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    const deletedUser = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User ↔ Skills junction
const fetchUserSkills = async (req, res) => {
  try {
    const user = req.user;
    const fetchSkillsQuery = `
    SELECT * FROM SkillPerUser sp
    JOIN skills s ON sp.skill_id=s.skill_id
    WHERE sp.user_id=$1`;
    const result = await pool.query(fetchSkillsQuery, [user.id]);
    const skills = result.rows;
    return res.status(200).json({
      success: true,
      message: skills.length
        ? "User skills fetched successfully"
        : "User doesn't have skill yet",
      skills,
    });
  } catch (error) {
    console.error("Error fetching user skill:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const addUserSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    if (!skillId) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }
    const user = req.user;
    const insertSkillQuery = `
    INSERT INTO SkillPerUser(user_id,skill_id)
    VALUES($1,$2)
    RETURNING *`;
    const result = await pool.query(insertSkillQuery, [user.id, skillId]);
    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
      skill: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      if (error.detail.includes("skills")) {
        return res.status(404).json({
          success: false,
          message: "Skill not found ",
        });
      }
    }
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Skill already exist for this user",
      });
    }
    console.error("Error adding skill to the user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteUserSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    if (!skillId) {
      return res.status(404).json({
        success: false,
        message: "Invalid skill id",
      });
    }
    const user = req.user;
    const deleteSkillQuery = `
    DELETE FROM SkillPerUser
    WHERE user_id=$1 and skill_id=$2
    RETURNING * `;
    const result = await pool.query(deleteSkillQuery, [user.id, skillId]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User doesn't have this skill",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
      deletedSkill: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      if (error.detail.includes("skills")) {
        return res.status(404).json({
          success: false,
          message: "Skill not found ",
        });
      }
    }
    console.error("Error deleting skill from the user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User ↔ Quiz Attempts junction
const createQuizAttempt = async (req, res) => {
  try {
    const user = req.user;
    const quizId = req.params.quizId;
    const score = req.body.score;
    if (!validator.isUUID(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }
    if (score == null || isNaN(score) || score < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid score",
      });
    }
    const insertQuizAttemptQuery = `
    INSERT INTO quizattempt (user_id,quiz_id,score)
    VALUES($1,$2,$3)
    RETURNING *`;
    const result = await pool.query(insertQuizAttemptQuery, [
      user.id,
      quizId,
      score,
    ]);
    const attempt = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "Attempt saved successfully",
      attempt,
    });
  } catch (error) {
    if (error.code === "23503") {
      if (error.detail.includes("quiz_id")) {
        return res.status(400).json({
          success: false,
          message: "Quiz not found",
        });
      }
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User ↔ Course junction
const getUserAttempts = async (req, res) => {
  try {
    const user = req.user;
    const fetchAttemptsQuery = `SELECT * FROM quizattempt WHERE user_id=$1`;
    const result = await pool.query(fetchAttemptsQuery, [user.id]);
    const attempts = result.rows;
    return res.status(200).json({
      success: true,
      message: attempts.length
        ? "Quiz attempts fetched successfully"
        : "User doesn't have attempted quizzes",
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const enrollUser = async (req, res) => {
  try {
    const { course_id } = req.params;
    const user_id = req.user.id;
    if (!validator.isUUID(course_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }
    const enroll = await pool.query(
      "INSERT INTO coursesperuser (course_id, user_id) VALUES ($1, $2) RETURNING *",
      [course_id, user_id]
    );

    if (enroll.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Incorrect enrollment",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User enrolled to course successfully",
      enroll: enroll.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      if (error.detail.includes("course_id")) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "User already enrolled to this course",
      });
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const user_id = req.user.id;
    const course = await pool.query(
      `SELECT cu.course_id,c.title,c.description,c.category,cu.enrolled_at
       FROM coursesperuser cu
       JOIN courses c ON c.course_id=cu.course_id
       WHERE cu.user_id=$1`,
      [user_id]
    );
    return res.status(200).json({
      success: true,
      message: course.rows.length
        ? "Enrolled courses fetched successfully"
        : "User isn't enrolled in any course yet",
      count: course.rowCount,
      enrolled: course.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User ↔ Lesson junction
const createLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lesson_id;
    if (!validator.isUUID(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }
    const createLessonProgressQueue = `
    INSERT INTO lessonprogress (user_id,lesson_id)
    VALUES($1,$2)
    RETURNING *`;
    const result = await pool.query(createLessonProgressQueue, [
      userId,
      lessonId,
    ]);
    const lessonProgress = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "Lesson progress created successfully",
      lessonProgress,
    });
  } catch (error) {
    if (error.code === "23503") {
      if (error.detail.includes("lesson_id")) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }
    }
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "User already progressed on this lesson",
      });
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lesson_id;
    if (!validator.isUUID(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }
    const updateLessonProgressQueue = `
    UPDATE lessonprogress
    SET progress='completed'
    WHERE user_id=$1 AND lesson_id=$2
    RETURNING *`;
    const result = await pool.query(updateLessonProgressQueue, [
      userId,
      lessonId,
    ]);
    const updatedLessonProgress = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Lesson progress updated successfully",
      updatedLessonProgress,
    });
  } catch (error) {
    console.error("error updating lesson progress", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getLessonsProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const getLessonsProgressQuery = `
     SELECT lp.user_id,lp.lesson_id,l.title,lp.progress
    FROM lessonprogress lp
    JOIN lessons l ON lp.lesson_id=l.lesson_id 
     WHERE user_id=$1
   `;
    const result = await pool.query(getLessonsProgressQuery, [userId]);
    const lessonsProgress = result.rows;
    return res.status(200).json({
      success: true,
      message: lessonsProgress.length
        ? "Lesson progress fetched successfully"
        : "No lessons progress found",
      lessonsProgress,
    });
  } catch (error) {
    console.error("Error fetching lessons progress", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lesson_id;
    if (!validator.isUUID(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }
    const getLessonProgressQuery = `
    SELECT lp.user_id,lp.lesson_id,l.title,lp.progress
    FROM lessonprogress lp
    JOIN lessons l ON lp.lesson_id=l.lesson_id 
    WHERE lp.user_id=$1 AND lp.lesson_id=$2
   `;
    const result = await pool.query(getLessonProgressQuery, [userId, lessonId]);
    const lessonProgress = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Lesson progress fetched successfully",
      lessonProgress,
    });
  } catch (error) {
    console.error("Error fetching lesson progress", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  fetchUsers,
  fetchUserById,
  createUser,
  deleteUser,
  updateUser,
  fetchUserSkills,
  addUserSkill,
  deleteUserSkill,
  createQuizAttempt,
  getUserAttempts,
  enrollUser,
  getUserCourses,
  createLessonProgress,
  updateLessonProgress,
  getLessonsProgress,
  getLessonProgress,
};
