const express = require("express");
const router = express.Router();
const controller = require("../controllers/skill.controller");
router.post("/createSkill", controller.createSkill);
router.patch("/updateSkill/:id", controller.updateSkill);
router.get("/fetchSkills", controller.fetchSkills);
router.get("/fetchSkill/:id", controller.fetchSkillById);
router.delete("/deleteSkill/:id", controller.deleteSkill);

module.exports = router;
