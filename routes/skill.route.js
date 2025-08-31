const express = require("express");
const router = express.Router();
const controller = require("../controllers/skill.controller");

// Skills CRUD
router.post("/", controller.createSkill);
router.patch("/:id", controller.updateSkill);
router.get("/", controller.fetchSkills);
router.get("/:id", controller.fetchSkillById);
router.delete("/:id", controller.deleteSkill);

module.exports = router;
