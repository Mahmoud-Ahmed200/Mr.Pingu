// Load environment variables
require("dotenv").config();

const express = require("express");
const cookieparser = require("cookie-parser");
const app = express();
const port = process.env.PORT;
const usersRouter = require("../routes/user.route");
const skillRouter = require("../routes/skill.route");
const authRouter = require("../routes/auth.route");
const quizRouter = require("../Routes/quizzes.route");
const coursesPerUser = require("../Routes/coursesPerUser.route")
const lessonRouter = require("../Routes/lessons.route")
const questionRouter = require("../routes/question.route");
const { checkUser } = require("../middleware/auth.middleware");
const { checkAdmin } = require("../middleware/admin.middleware");
// Middleware
app.use(express.json());
app.use(cookieparser());
// Routes
app.use("/auth", authRouter);
app.use("/user", checkUser, usersRouter);
app.use("/skill", checkUser, checkAdmin, skillRouter);
// <<<<<<< HEAD:SERVER/src/index.js
app.use("/quiz",checkUser, quizRouter)
app.use("/lesson", checkUser, lessonRouter);
app.use("/coursesPeruser", checkUser, coursesPerUser);
// =======
app.use("/question", checkUser, checkAdmin, questionRouter);
// >>>>>>> 49c44d1bee32a584b128c8e4e549ed1f46a70dd8:src/index.js
// Server Start
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
