const pool = require("../config/db.js");
const validator = require("validator");
const createQuiz = async (req, res) => {
  try {
    const { title, passing_score, total_score, xp_reward, time_limit } =
      req.body;

    const quiz = await pool.query(
      "INSERT INTO quizzes (title,  passing_score, total_score, xp_reward,time_limit) values ($1, $2, $3, $4, $5) RETURNING *",
      [title, passing_score, total_score, xp_reward, time_limit]
    );

    if (quiz.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Could not create this quiz, please try again.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Quiz created successfully",
      quiz: quiz.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await pool.query("SELECT * FROM quizzes");
    if (quizzes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No quizzes found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quizzes fetched successfully",
      quizzes: quizzes.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    if (!validator.isUUID(quiz_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }
    const quiz = await pool.query("SELECT * FROM quizzes WHERE quiz_id=$1", [
      quiz_id,
    ]);

    if (quiz.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Quiz fetched successfully",
      quiz: quiz.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    if (!validator.isUUID(quiz_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }
    const getQuery = `SELECT * FROM quizzes WHERE quiz_id=$1`;
    const getQuiz = await pool.query(getQuery, [quiz_id]);
    if (!quiz_id) {
      return res.status(404).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }
    let { title, passing_score, total_score, xp_reward, time_limit } = req.body;

    if (!title) {
      title = getQuiz.rows[0].title;
    }
    if (!passing_score) {
      passing_score = getQuiz.rows[0].passing_score;
    }
    if (!total_score) {
      total_score = getQuiz.rows[0].total_score;
    }
    if (xp_reward) {
      xp_reward = getQuiz.rows[0].xp_reward;
    }
    if (!time_limit) {
      time_limit = getQuiz.rows[0].time_limit;
    }

    const quiz = await pool.query(
      "UPDATE quizzes SET title =$1 , passing_score=$2, total_score=$3, xp_reward=$4, time_limit=$5 WHERE quiz_id=$6 RETURNING *",
      [title, passing_score, total_score, xp_reward, time_limit, quiz_id]
    );

    if (quiz.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: quiz.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    if (!validator.isUUID(quiz_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }

    const quiz = await pool.query(
      "DELETE FROM quizzes WHERE quiz_id=$1 RETURNING *",
      [quiz_id]
    );

    if (quiz.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
      quiz: quiz.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Quiz ↔ User
const getQuizAttempts = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    if (!validator.isUUID(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }
    const getQuizAttemptsQuery = `
    SELECT q.quiz_id,q.user_id,u.username,q.score,q.attempted_at
    FROM quizattempt q
    JOIN users u ON u.user_id=q.user_id
    WHERE quiz_id=$1`;
    const result = await pool.query(getQuizAttemptsQuery, [quizId]);
    const attempts = result.rows;
    return res.status(200).json({
      success: true,
      message: attempts.length
        ? "Quiz attempts fetched successfully"
        : "No quiz attempts found",
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
const getQuizAttempt = async (req, res) => {
  try {
    const { quizId, userId } = req.params;
    if (!validator.isUUID(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz Id",
      });
    }
    if (!validator.isUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user Id",
      });
    }

    const getQuizAttemptQuery = `
    SELECT q.quiz_id,q.user_id,u.username,q.score,q.attempted_at
    FROM quizattempt q
    JOIN users u ON u.user_id=q.user_id
    WHERE q.user_id=$1 AND q.quiz_id=$2
    `;
    const result = await pool.query(getQuizAttemptQuery, [userId, quizId]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }
    const attempt = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Quiz attempt fetched successfully",
      attempt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Quiz ↔ Question
const addQuestionToQuiz = async (req, res) => {
  try {
    const quizId = req.params.quiz_id;
    const questionId = req.params.question_id;
    if (!validator.isUUID(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }
    if (!validator.isUUID(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }
    const addQuestionToQuizQuery = `
    INSERT INTO quiz_questions (quiz_id,question_id)
    VALUES ($1,$2)
    RETURNING *`;
    const result = await pool.query(addQuestionToQuizQuery, [
      quizId,
      questionId,
    ]);
    return res.status(201).json({
      success: true,
      message: "Question added to quiz successfully",
      insertedQuestion: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Question already exist on the quiz",
      });
    }
    console.error("Error adding question to quiz", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const removeQuestionFromQuiz = async (req, res) => {
  try {
    const quizId = req.params.quiz_id;
    const questionId = req.params.question_id;
    if (!validator.isUUID(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }
    if (!validator.isUUID(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }
    const removeQuestionFromQuizQuery = `
    DELETE FROM quiz_questions 
    WHERE quiz_id=$1 AND question_id=$2
    RETURNING *`;
    const result = await pool.query(removeQuestionFromQuizQuery, [
      quizId,
      questionId,
    ]);
    return res.status(200).json({
      success: true,
      message: "Question deleted from quiz successfully",
      deletedQuestion: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting question from quiz", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getQuizQuestions = async (req, res) => {
  try {
    const quizId = req.params.quiz_id;
    if (!validator.isUUID(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }
    const getQuizQuestionsQuery = `
    SELECT q.quiz_id,q.question_id,qu.title,qu.difficulty
    FROM quiz_questions q
    JOIN questions qu ON q.question_id=qu.question_id
    WHERE q.quiz_id=$1`;
    const result = await pool.query(getQuizQuestionsQuery, [quizId]);
    return res.status(200).json({
      success: false,
      message: "Quiz question fetched successfully",
      count: result.rowCount,
      question: result.rows,
    });
  } catch (error) {
    console.error("Error fetching question from quiz", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizAttempts,
  getQuizAttempt,
  addQuestionToQuiz,
  removeQuestionFromQuiz,
  getQuizQuestions,
};
