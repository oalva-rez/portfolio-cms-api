const express = require("express");
const router = express.Router();
const { upload } = require("../../../controllers/aws-sdk");

const {
  createNewProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
} = require("../../../controllers/projectsController");

// create new project
router.post("/create", upload.single("projImage"), createNewProject);

// get all projects
router.get("/", getAllProjects);

// get project by id
router.get("/:id", getProjectById);

// update project by id
router.put("/:id", upload.single("projImage"), updateProjectById);

//delete project by id
router.delete("/:id", deleteProjectById);

module.exports = router;
