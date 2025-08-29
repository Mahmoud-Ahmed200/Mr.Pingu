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
    VALUES($1,$2)`;
    const result = await pool.query(insertSkillQuery, [user.id, skillId]);
    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
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
    const deleteSkillQuery = `DELETE FROM SkillPerUser WHERE user_id=$1 and skill_id=$2`;
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

module.exports = {
  fetchUsers,
  fetchUserById,
  createUser,
  deleteUser,
  updateUser,
  fetchUserSkills,
  addUserSkill,
  deleteUserSkill,
};
