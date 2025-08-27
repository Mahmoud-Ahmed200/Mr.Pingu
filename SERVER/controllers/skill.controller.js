const pool = require("../config/db");

const createSkill = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const xp = req.body.xp;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const values = [title];
    let insertQuerySkill =
      xp != null
        ? `INSERT INTO skills (title,xp) VALUES ($1,$2) RETURNING *`
        : `INSERT INTO skills (title)  VALUES ($1) RETURNING *`;
    if (xp != null) values.push(xp);
    const result = await pool.query(insertQuerySkill, values);
    const skill = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "Skill inserted successfully",
      skill,
    });
  } catch (error) {
    console.error("Error inserting skill:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body.title?.trim();
    const xp = req.body.xp;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }
    const skillQuery = `SELECT * FROM skills WHERE skill_id=$1`;
    const skillQueryResult = await pool.query(skillQuery, [id]);
    if (skillQueryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }
    const skill = skillQueryResult.rows[0];
    const fields = [];
    const values = [id];
    const unChanged = {};
    let counter = 2;
    if (title !== undefined) {
      if (title === skill.title) {
        unChanged["title"] =
          "Title is already the current one, Nothing changed";
      } else {
        fields.push(`title=$${counter++}`);
        values.push(title);
      }
    }
    if (xp !== undefined) {
      if (xp === skill.xp) {
        unChanged["xp"] = "XP is already the current one, Nothing changed";
      } else {
        fields.push(`xp=$${counter++}`);
        values.push(xp);
      }
    }
    if (fields.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
        skill,
      });
    }
    const updateQuery = `
    UPDATE skills 
    SET ${fields.join(", ")}
    WHERE skill_id=$1
    RETURNING *`;
    const result = await pool.query(updateQuery, values);
    const updatedSkill = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Skill data updated successfully",
      updatedSkill,
      unChanged,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchSkills = async (req, res) => {
  try {
    const fetchQuery = `SELECT * FROM skills`;
    const result = await pool.query(fetchQuery);
    const skills = result.rows;
    return res.status(200).json({
      success: true,
      message: skills.length
        ? "Skills fetched successfully"
        : "No skills available yet",
      skills,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const fetchSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }
    const fetchQuery = `
    SELECT * FROM skills
    WHERE skill_id=$1
    `;
    const result = await pool.query(fetchQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }
    const skill = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Skill fetched successfully",
      skill,
    });
  } catch (error) {
    console.error("Error fetching skill:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }
    const deleteQuery = `
    DELETE FROM skills
    WHERE skill_id=$1
    RETURNING *`;
    const result = await pool.query(deleteQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    const deletedSkill = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
      deletedSkill,
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
