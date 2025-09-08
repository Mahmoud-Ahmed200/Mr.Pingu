// Load environment variables
require("dotenv").config();

const express = require("express");
const cookieparser = require("cookie-parser");
const app = express();
const port = process.env.PORT;

const usersRouter = require("../routes/user.route");
const skillRouter = require("../routes/skill.route");
const authRouter = require("../routes/auth.route");
const questionRouter = require("../routes/question.route");
const quizRouter = require("../routes/quizzes.route");
const courseRouter = require("../routes/courses.route");
const lessonRouter = require("../routes/lessons.route");

const { checkUser } = require("../middleware/auth.middleware");
const { checkAdmin } = require("../middleware/auth.middleware");
// Middleware
app.use(express.json());
app.use(cookieparser());
// Routes
app.use("/auth", authRouter);
app.use("/user", checkUser, usersRouter);
app.use("/skill", skillRouter);
app.use("/question", checkUser, checkAdmin, questionRouter);
app.use("/quiz", checkUser, checkAdmin, quizRouter);
app.use("/course", courseRouter);
app.use("/lesson", checkUser, checkAdmin, lessonRouter);
// Server Start
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
