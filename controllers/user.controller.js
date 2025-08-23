const pool = require("../config/db");

const createUser = async (req, res) => {
  const { username, email, hashedPass, certificateName } = req.body;
  if (!username || !email || !hashedPass || !certificateName) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }
  const insert_query = `INSERT INTO users (username,email,hashed_pass,certificate_name)
     VALUES ($1,$2,$3,$4)
     RETURNING *
      `;
  try {
    const result = await pool.query(insert_query, [
      username,
      email,
      hashedPass,
      certificateName,
    ]);
    return res.status(201).json({
      message: "Data inserted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
const fetchUsers = async (req, res) => {
  try {
    const fetchQuery = `
    SELECT * 
    FROM users
    `;
    const result = await pool.query(fetchQuery);
    if (result.rowCount === 0)
      return res.status(404).json({
        message: "Users not inserted",
      });
    return res.status(200).json({
      Users: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.message,
    });
  }
};
const fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }
    const fetchQuery = `
    SELECT *
    FROM users
    WHERE user_id=$1
     `;
    const result = await pool.query(fetchQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        message: "User not found",
      });
    return res.status(200).json({
      User: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, certificateName } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }
    const userQuery = "SELECT * FROM users WHERE user_id=$1";
    const userResult = await pool.query(userQuery, [id]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    const user = userResult.rows[0];
    const fields = [];
    const values = [id];
    const unChanged = {};
    let counter = 2;
    if (username !== undefined) {
      if (user.username === username) {
        unChanged["username"] =
          "Username is already the current one, Nothing changed";
      } else {
        fields.push(`username=$${counter++}`);
        values.push(username);
      }
    }
    if (certificateName !== undefined) {
      if (user.certificate_name === certificateName) {
        unChanged["certificate_name"] =
          "Certificate name is already the current one, Nothing changed";
      } else {
        fields.push(`certificate_name=$${counter++}`);
        values.push(certificateName);
      }
    }
    if (fields.length === 0) {
      return res
        .status(200)
        .json({ message: "No changes detected", user, unChanged });
    }
    const update_query = `
    UPDATE users SET ${fields.join(" , ")}
    WHERE user_id=$1
    RETURNING *`;
    const result = await pool.query(update_query, values);
    return res.status(200).json({
      message: "Data updated successfully",
      updatedUser: result.rows[0],
      unChanged,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }
    const deleteQuery = `
    DELETE FROM users 
    WHERE user_id=$1 
    RETURNING *
    `;
    const result = await pool.query(deleteQuery, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        error: "User not found",
      });
    return res.status(200).json({
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = {
  fetchUsers,
  fetchUserById,
  createUser,
  deleteUser,
  updateUser,
};
