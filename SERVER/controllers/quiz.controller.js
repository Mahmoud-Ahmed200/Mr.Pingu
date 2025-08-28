const pool = require("../config/db.js");

const createQuiz = async (req, res) => {
  try {
    const {
      quiz_id,
      title,
      passing_score,
      total_score,
      xp_reward,
      time_limit,
    } = req.body;

    const quiz = await pool.query(
      "INSERT INTO quizzes (quiz_id,title,  passing_score, total_score, xp_reward,time_limit) values ($1, $2, $3, $4, $5, $6) RETURNING *",
      [quiz_id, title, passing_score, total_score, xp_reward, time_limit]
    );

    if (quiz.rows.length == 0) {
      return res
        .status(404)
        .json("could not create this lesson, please try again.");
    }

    res.status(200).json(quiz.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const getAllQuizes = async (req, res) => {
  try {
    const quizes = await pool.query("SELECT * FROM quizzes");
    if (quizes.rows.length == 0) {
      return res.status(404).json("No quizzes found.");
    }

    res.status(200).json(quizes.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const getQuizById = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    
    if (!quiz_id) {
      return res.status(404).json("not valid quiz id");
    }
    const quiz = await pool.query("SELECT * FROM quizzes WHERE quiz_id=$1", [
      quiz_id,
    ]);

    if (quiz.rows.length == 0) {
      return res.status(404).json("couldn't found the quiz");
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;

    if (!quiz_id) {
      return res.status(404).json("not valid quiz id");
    }
    const { title, passing_score, total_score, xp_reward, time_limit } =
      req.body;
    const quiz = await pool.query(
      "UPDATE quizzes SET title =$1 , passing_score=$2, total_score=$3, xp_reward=$4, time_limit=$5 WHERE quiz_id=$6 RETURNING *",
      [title, passing_score, total_score, xp_reward, time_limit, quiz_id]
    );

    if (quiz.rows.length == 0) {
      return res.status(404).json("couldn't found the quiz");
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    if(!quiz_id){
        return res.status(404).json("not valid quiz id")
    }

    const quiz = await pool.query(
      "DELETE FROM quizzes WHERE quiz_id=$1 RETURNING *",
      [quiz_id]
    );

    if (quiz.rows.length == 0) {
      return res.status(404).json("couldn't found the quiz");
    }

    res.status(200).json(quiz.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

module.exports = {
  createQuiz,
  getAllQuizes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
