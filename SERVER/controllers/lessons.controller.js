const pool = require("../config/db.js");
const express = require("express");
const { updateCourse } = require("./courses.controller");

const createLesson = async (req, res) => {
  try {
    const {
      lesson_id,
      title,
      content_documented,
      course_id,
      quiz_id,
      xp,
      content_video,
    } = req.body;

    const newLesson = await pool.query(
      "INSERT INTO lessons ( lesson_id, title,content_documented,course_id,quiz_id,xp,content_video) values($1, $2, $3, $4, $5, $6, $7)",
      [
        lesson_id,
        title,
        content_documented,
        course_id,
        quiz_id,
        xp,
        content_video,
      ]
    );

    res.status(200).json(newLesson.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const getAllLessons = async (req, res) => {
  try {
    const lessons = await pool.query("SELECT * FROM lessons");
    if (lessons.rows.length == 0) {
      return res.status(404).json("No lessons found");
    }

    res.status(200).json(lessons.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const getLessonById = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const lesson = await pool.query(
      "SELECT * FROM lessons WHERE lesson_id=$1",
      [lesson_id]
    );

    if (lesson.rows.length == 0) {
      return res.status(404).json("Lesson not found");
    }

    res.status(200).json(lesson.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

const updateLesson = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const { title, content_documented, course_id, quiz_id, xp, content_video } =
      req.body;

    const lesson = await pool.query(
      "UPDATE lessons SET title=$1, content_documented=$2, course_id=$3, quiz_id=$4, xp=$5, content_video=$6 WHERE lesson_id = $7 RETURNING *",
      [
        title,
        content_documented,
        course_id,
        quiz_id,
        xp,
        content_video,
        lesson_id,
      ]
    );

    if (lesson.rows.length) {
      return res.status(404).json("Lesson not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};


const deleteLesson = async (req,res) => {
    try {
        const {lesson_id} = req.params;
        const lesson = await pool.query("DELETE FROM lessons WHERE lesson_id=$1 RETURNING *", [lesson_id])
        res.status();
    } catch (error) {
        
    }
};


