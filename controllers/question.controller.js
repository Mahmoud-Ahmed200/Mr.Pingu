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

//Question ↔ Option junction
const createQuestionOption = async (req, res) => {
  try {
    const id = req.params.id;
    const optionText = req.body.optionText?.trim();
    const isCorrect = req.body.isCorrect;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }
    if (!optionText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const values = [id, optionText];
    if (isCorrect !== undefined) values.push(isCorrect);
    const createQuestionOptionQuery =
      isCorrect !== undefined
        ? `insert into question_option (question_id,option_text,is_correct)
    VALUES($1,$2,$3)
    RETURNING *`
        : `insert into question_option(question_id,option_text)
    VALUES($1,$2)
    RETURNING *`;
    const result = await pool.query(createQuestionOptionQuery, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    const questionOption = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "Question option created successfully",
      questionOption,
    });
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail.includes("option_text")) {
        return res.status(400).json({
          success: false,
          message: "Option is already exist",
        });
      }
    }
    if (error.code === "23503") {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    console.error("Error creating question option: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchQuestionOptions = async (req, res) => {
  try {
    const id = req.params.id;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }
    const questionCheckQuery = `SELECT (question_id) FROM questions WHERE question_id=$1`;
    const questionCheck = await pool.query(questionCheckQuery, [id]);
    if (questionCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    const fetchQuestionOptionsQuery = `SELECT * FROM question_option WHERE question_id=$1`;
    const result = await pool.query(fetchQuestionOptionsQuery, [id]);
    const questionOptions = result.rows;
    return res.status(200).json({
      success: true,
      message: questionOptions.length
        ? "Question options fetched successfully"
        : "No options available for this question",
      questionOptions,
    });
  } catch (error) {
    console.error("Error fetching question options: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateQuestionOption = async (req, res) => {
  try {
    const id = req.params.optionId;
    const optionText = req.body.optionText?.trim();
    const isCorrect = req.body.isCorrect;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question Id",
      });
    }
    let counter = 2;
    const fields = [];
    const values = [id];
    if (optionText !== undefined) {
      values.push(optionText);
      fields.push(`option_text=$${counter++}`);
    }
    if (isCorrect !== undefined) {
      values.push(isCorrect);
      fields.push(`is_correct=$${counter++}`);
    }
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }
    const updateQuestionOptionQuery = `
    UPDATE question_option
    SET ${fields.join(", ")}
    WHERE option_id=$1
    RETURNING *`;
    console.log(updateQuestionOptionQuery);
    const result = await pool.query(updateQuestionOptionQuery, values);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Option not found",
      });
    }
    const updatedQuestionOption = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Option updated successfully",
      updatedQuestionOption,
    });
  } catch (error) {
    console.error("Error updating question option: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteQuestionOption = async (req, res) => {
  try {
    const id = req.params.optionId;
    if (!validator.isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }
    const deleteOptionQuery = `DELETE FROM question_option WHERE option_id=$1 RETURNING *`;
    const result = await pool.query(deleteOptionQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Option not found",
      });
    }
    const deletedOption = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Option deleted successfully",
      deletedOption,
    });
  } catch (error) {
    console.error("Error updating question option: ", error);
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
  fetchQuestionOptions,
  createQuestionOption,
  updateQuestionOption,
  deleteQuestionOption,
};
