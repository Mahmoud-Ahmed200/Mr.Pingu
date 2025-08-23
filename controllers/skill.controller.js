const pool = require("../config/db");

const createSkill = async (req, res) => {
  try {
    const { title, xp } = req.body;
    if (!title) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const values = [title];
    let insertQuerySkill = ``;
    if (xp != null) {
      insertQuerySkill = `
    INSERT INTO skills (title,xp) 
    VALUES ($1,$2)
    RETURNING *`;
      values.push(xp);
    } else {
      insertQuerySkill = `
    INSERT INTO skills (title) 
    VALUES ($1)
    RETURNING *`;
    }
    const result = await pool.query(insertQuerySkill, values);
    return res.status(201).json({
      message: "Skill inserted successfully",
      Skill: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, xp } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: "Invalid skill ID",
      });
    }
    const skillQuery = `SELECT * FROM skills WHERE skill_id=$1`;
    const skillQueryResult = await pool.query(skillQuery, [id]);
    if (skillQueryResult.rowCount === 0) {
      res.status(404).json({
        error: "Skill not found",
      });
    }
    const fields = [];
    const values = [id];
    let counter = 2;
    const unChanged = {};
    if (title !== undefined) {
      if (title === skillQueryResult.rows[0].title) {
        unChanged["title"] =
          "Title is already the current one, Nothing changed";
      } else {
        fields.push(`title=$${counter++}`);
        values.push(title);
      }
    }
    if (xp !== undefined) {
      if (xp === skillQueryResult.rows[0].xp) {
        unChanged["xp"] = "XP is already the current one, Nothing changed";
      }
      fields.push(`xp=$${counter++}`);
      values.push(xp);
    }
    if (fields.length === 0) {
      res.status(400).json({
        error: "No changes detected",
      });
    }
    const updateQuery = `
    UPDATE skills 
    SET ${fields.join(", ")}
    WHERE skill_id=$1
    RETURNING *`;
    const result = await pool.query(updateQuery, values);

    res.status(200).json({
      message: "Data updated successfully",
      updatedSkill: result.rows[0],
      unChanged,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
const fetchSkills = async (req, res) => {
  try {
    const fetchQuery = `SELECT * FROM skills`;
    const result = await pool.query(fetchQuery);
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Skills not inserted",
      });
    }
    return res.status(200).json({
      Skills: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
const fetchSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: "Invalid skill ID",
      });
    }
    const fetchQuery = `
    SELECT * FROM skills
    WHERE skill_id=$1
    `;
    const result = await pool.query(fetchQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Skill not found",
      });
    }
    return res.status(200).json({
      Skill: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: "Invalid skill ID",
      });
    }
    const deleteQuery = `
    DELETE FROM skills
    WHERE skill_id=$1
    RETURNING *`;
    const result = await pool.query(deleteQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        error: "Skill not found",
      });
    return res.status(200).json({
      message: "Skill deleted successfully",
      Skill: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
module.exports = {
  createSkill,
  updateSkill,
  fetchSkills,
  fetchSkillById,
  deleteSkill,
};
