const express = require("express");
const db = require("../config/db.js");
const app = express();

const getAllCourses = async (req, res) => {
  try {
    const result = await db.con.query("SELECT * FROM courses");
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
};

const addCourse = async (req, res) => {
  try {
    const { course_id, title, category, description } = req.body;
    const newCourse = await db.con.query(
      "INSERT INTO courses (course_id, title, category, description) values ($1, $2, $3, $4) RETURNING *",
      [course_id, title, category, description]
    );

    res.status(200).json(newCourse.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const deletedCourse = await db.con.query(
      "DELETE FROM courses WHERE course_id = $1 RETURNING *",
      [course_id]
    );

    if (deletedCourse.rows.length == 0) {
      return res.statu(404).json("course not found");
    }
    res.status(200).json(deletedCourse.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
};

const getCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const course = await db.con.query(
      "SELECT * FROM courses WHERE course_id = $1",
      [course_id]
    );
    if (course.rows.length == 0) {
      return res.statu(404).json("course not found");
    }
    res.status(200).json(course.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
};

const updateCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { title, category, description } = req.body;
    const course = await db.con.query(
      `UPDATE courses 
       SET title = $1, category = $2, description = $3 
       WHERE course_id = $4 
       RETURNING *`,
      [title, category, description, course_id]
    );
    if (course.rows.length) {
      return res.status(404).json("Course not found");
    }

    res.status(200).json(course.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  deleteCourse,
  updateCourse
};
