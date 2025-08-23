const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
router.get("/fetchUsers", controller.fetchUsers);
router.get("/fetchUser/:id", controller.fetchUserById);
router.post("/createUser", controller.createUser);
router.delete("/deleteUser/:id", controller.deleteUser);
router.patch("/updateUser/:id", controller.updateUser);
module.exports = router;
