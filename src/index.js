require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const usersRoute = require("../routes/user.route");
const skillRouter = require("../routes/skill.route");
app.use(express.json());
app.use("/user", usersRoute);
app.use("/skill", skillRouter);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
