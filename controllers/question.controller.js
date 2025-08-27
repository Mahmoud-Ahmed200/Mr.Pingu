const pool = require("../config/db");
const validator = require("validator");
const addQuestion = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const difficulty = req.body.difficulty?.trim();
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    if (
      difficulty &&
      !validator.isIn(difficulty, ["beginner", "intermediate", "advanced"])
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Difficulty must be between beginner, intermediate, and advanced",
      });
    }
    const values = [title];
    const addQuestionQuery =
      difficulty != null
        ? `
    INSERT INTO questions (title,difficulty)
    VALUES($1,$2)
    RETURNING *`
        : `
    INSERT INTO questions (title)
    VALUES($1)
    RETURNING *`;
    if (difficulty != null) values.push(difficulty);
    const result = await pool.query(addQuestionQuery, values);
    const question = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "Question inserted successfully",
      question,
    });
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail.includes("title")) {
        return res.status(400).json({
          success: false,
          message: "Question is already exist",
        });
      }
    }
    console.error("Error creating question", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchQuestions = async (req, res) => {
  try {
    const fetchQuestionsQuery = `SELECT * FROM questions`;
    const result = await pool.query(fetchQuestionsQuery);
    const questions = result.rows;
    return res.status(200).json({
      success: true,
      message: questions.length
        ? "Questions fetched successfully"
        : "No question available yet",
      questions,
    });
  } catch (error) {
    console.error("Error fetching Questions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchQuestionByID = async (req, res) => {
  try {
    const id = req.params.id;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }
    const fetchQuestionQuery = `SELECT * FROM questions WHERE question_id=$1`;
    const result = await pool.query(fetchQuestionQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    const question = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Question fetched successfully",
      question,
    });
  } catch (error) {
    console.error("Error fetching Question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const title = req.body.title?.trim();
    const difficulty = req.body.difficulty?.trim();
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }
    if (
      difficulty &&
      !validator.isIn(difficulty, ["beginner", "intermediate", "advanced"])
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Difficulty must be between beginner, intermediate, and advanced",
      });
    }
    const fields = [];
    const values = [id];
    let counter = 2;
    if (title !== undefined) {
      fields.push(`title=$${counter++}`);
      values.push(title);
    }
    if (difficulty !== undefined) {
      fields.push(`difficulty=$${counter++}`);
      values.push(difficulty);
    }
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }
    const update_query = `
    UPDATE questions
    SET ${fields.join(" , ")}
    WHERE question_id=$1
    RETURNING *`;
    const result = await pool.query(update_query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    const updatedQuestion = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }
    const deleteQuestionQuery = `DELETE FROM questions WHERE question_id=$1 RETURNING *`;
    const result = await pool.query(deleteQuestionQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    const deletedQuestion = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      deletedQuestion,
    });
  } catch (error) {
    console.error("Error deleting Question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  addQuestion,
  fetchQuestions,
  fetchQuestionByID,
  deleteQuestion,
  updateQuestion,
};
