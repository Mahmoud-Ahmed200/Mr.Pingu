// Load environment variables
require("dotenv").config();

const express = require("express");
const cookieparser = require("cookie-parser");
const app = express();
const port = process.env.PORT;
const usersRouter = require("../routes/user.route");
const skillRouter = require("../routes/skill.route");
const authRouter = require("../routes/auth.route");
const { checkUser } = require("../middleware/auth.middleware");
const { checkAdmin } = require("../middleware/admin.middleware");
// Middleware
app.use(express.json());
app.use(cookieparser());
// Routes
app.use("/auth", authRouter);
app.use("/user", checkUser, usersRouter);
app.use("/skill", checkUser, checkAdmin, skillRouter);
// Server Start
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
